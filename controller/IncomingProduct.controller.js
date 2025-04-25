const mongoose = require("mongoose");
const axios = require("axios");
const IncomingProduct = require("../model/incoming.model"); // Model faylingizga yo‘lni sozlang
const Response = require("../utils/response"); // Response class faylingizga yo‘lni sozlang
require("dotenv").config();

const imgbbApiKey = process.env.IMGBB_API_KEY;

class IncomingProductController {
  // Yangi kirim mahsulot yaratish (imgBB ga rasm yuklash bilan)
  async createIncomingProduct(req, res) {
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
      if (req.file) {
        // Agar rasm yuklansa, uni imgBB ga jo‘natamiz
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
          imageUrl = response.data.data.url; // Muvaffaqiyatli yuklansa, rasm URL olinadi
        } else {
          return Response.error(res, "Rasmni imgBB ga yuklashda xatolik");
        }
      }

      const totalCost = quantity * unitPrice; // Umumiy narx hisoblanadi

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

      const savedProduct = await newProduct.save();
      return Response.created(res, "Kirim mahsulot yaratildi", savedProduct);
    } catch (error) {
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
      const products = await IncomingProduct.find().populate("supplier");
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
}

module.exports = new IncomingProductController();
