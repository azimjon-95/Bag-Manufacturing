const mongoose = require("mongoose");
const axios = require("axios");
const IncomingProduct = require("../model/incoming.model"); // Model faylingizga yo‘lni sozlang
const Response = require("../utils/response"); // Response class faylingizga yo‘lni sozlang
require("dotenv").config();
const ProducedStorySchema = require("../model/producedStory");

const imgbbApiKey = process.env.IMGBB_API_KEY;

class IncomingProductController {
  // Yangi kirim mahsulot yaratish (imgBB ga rasm yuklash bilan)
  async createIncomingProduct(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        productName,
        category,
        supplier,
        quantity,
        unitPrice,
        color,
        size,
        uniqueCode,
        warehouseId,
        description,
      } = req.body;

      let imageUrl = null;

      // Rasm yuklash (agar bo‘lsa)
      if (req.file) {
        const formData = new FormData();
        formData.append("image", req.file.buffer.toString("base64"));

        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success) {
          imageUrl = response.data.data.url;
        } else {
          throw new Error("Rasmni imgBB ga yuklashda xatolik");
        }
      }

      const totalCost = quantity * unitPrice;

      const newProduct = new IncomingProduct({
        productName,
        category,
        supplier,
        quantity,
        unitPrice,
        totalCost,
        color,
        size,
        uniqueCode,
        warehouseId,
        description,
        image: imageUrl,
      });

      const savedProduct = await newProduct.save({ session });

      await ProducedStorySchema.create(
        [
          {
            productId: savedProduct._id,
            quantity: savedProduct.quantity,
          },
        ],
        { session }
      );

      // Transactionni commit qilamiz
      await session.commitTransaction();
      session.endSession();

      return Response.created(res, "Kirim mahsulot yaratildi", savedProduct);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      if (error.code === 11000) {
        return Response.error(res, "Bu kod allaqachon mavjud");
      }

      return Response.serverError(
        res,
        "Kirim mahsulot yaratishda xatolik",
        error.message
      );
    }
  }

  async getAllIncomingProducts(req, res) {
    try {
      const products = await IncomingProduct.find()
        .populate("supplier")
        .populate("warehouseId", "name");
      if (!products.length)
        return Response.notFound(res, "Kirim mahsulotlar topilmadi");
      return Response.success(res, "Kirim mahsulotlar olindi", products);
    } catch (error) {
      return Response.serverError(
        res,
        "Mahsulotlarni olishda xatolik",
        error.message
      );
    }
  }

  // Bitta kirim mahsulotni ID bo‘yicha olish
  async getIncomingProductById(req, res) {
    try {
      const product = await IncomingProduct.findById(req.params.id);
      if (!product) {
        return Response.notFound(res, "Kirim mahsulot topilmadi");
      }
      return Response.success(res, "Kirim mahsulot olindi", product);
    } catch (error) {
      return Response.serverError(
        res,
        "Mahsulotni olishda xatolik",
        error.message
      );
    }
  }

  // Kirim mahsulotni yangilash
  async updateIncomingProduct(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      if (req.file) {
        // Agar yangi rasm yuklansa, uni imgBB ga jo‘natamiz
        const formData = new FormData();
        formData.append("image", req.file.buffer.toString("base64"));

        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success) {
          updateData.image = response.data.data.url;
        } else {
          return Response.error(res, "Rasmni imgBB ga yuklashda xatolik");
        }
      }

      if (updateData.quantity && updateData.unitPrice) {
        updateData.totalCost = updateData.quantity * updateData.unitPrice; // Yangi umumiy narx
      }

      const updatedProduct = await IncomingProduct.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedProduct) {
        return Response.notFound(res, "Kirim mahsulot topilmadi");
      }
      return Response.success(res, "Kirim mahsulot yangilandi", updatedProduct);
    } catch (error) {
      if (error.code === 11000) {
        return Response.error(res, "Bu kod allaqachon mavjud");
      }
      return Response.serverError(
        res,
        "Mahsulotni yangilashda xatolik",
        error.message
      );
    }
  }

  // Kirim mahsulotni o‘chirish
  async deleteIncomingProduct(req, res) {
    try {
      const { id } = req.params;
      const deletedProduct = await IncomingProduct.findByIdAndDelete(id);

      if (!deletedProduct) {
        return Response.notFound(res, "Kirim mahsulot topilmadi");
      }
      return Response.success(res, "Kirim mahsulot o‘chirildi", deletedProduct);
    } catch (error) {
      return Response.serverError(
        res,
        "Mahsulotni o‘chirishda xatolik",
        error.message
      );
    }
  }

  async getGroupedIncomingProducts(req, res) {
    try {
      const groupedProducts = await IncomingProduct.aggregate([
        {
          $lookup: {
            from: "customers", // "Customers" modelining collection nomi kichik harflarda bo'lishi kerak
            localField: "supplier",
            foreignField: "_id",
            as: "supplier",
          },
        },
        { $unwind: "$supplier" },
        {
          $group: {
            _id: {
              supplierId: "$supplier._id",
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$entryDate" },
              },
            },
            fullName: { $first: "$supplier.fullName" },
            phone: { $first: "$supplier.phoneNumber" },
            address: { $first: "$supplier.address" },
            entryDate: { $first: "$entryDate" },
            totalPrice: { $sum: "$totalCost" },
            products: {
              $push: {
                name: "$productName",
                category: "$category",
                quantity: "$quantity",
                unitPrice: "$unitPrice",
                totalCost: "$totalCost",
                color: "$color",
                size: "$size",
                uniqueCode: "$uniqueCode",
                warehouseId: "$warehouseId",
                description: "$description",
                image: "$image",
              },
            },
          },
        },
        {
          $sort: { "_id.date": -1 }, // so'nggi sanalar birinchi chiqadi
        },
      ]);

      if (!groupedProducts.length) {
        return res.status(404).json({ message: "Kirim mahsulotlar topilmadi" });
      }

      return res.status(200).json({
        message: "Kirim mahsulotlar guruhlab olindi",
        data: groupedProducts,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Kirim mahsulotlarni guruhlab olishda xatolik",
        error: error.message,
      });
    }
  }
}

module.exports = new IncomingProductController();
