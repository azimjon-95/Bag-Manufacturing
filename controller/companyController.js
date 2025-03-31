const Company = require('../model/Company');
const response = require('../utils/response');

class CompanyController {
    // Barcha kompaniyalarni olish (faqat bitta bo'ladi)
    static async getCompanies(req, res) {
        try {
            const companies = await Company.find();
            return response.success(res, "Kompaniyalar ro'yxati", companies);
        } catch (error) {
            return response.error(res, "Kompaniyalarni olishda xatolik", [error.message], 500);
        }
    }

    // Kompaniya yaratish yoki yangilash
    static async createOrUpdateCompany(req, res) {
        try {
            // Mavjud kompaniyalarni tekshirish
            const existingCompany = await Company.findOne();

            if (!existingCompany) {
                // Agar hech qanday kompaniya bo'lmasa, yangi yaratish
                const company = new Company(req.body);
                await company.save();
                return response.success(res, "Kompaniya muvaffaqiyatli yaratildi", company, 201);
            } else {
                // Agar kompaniya mavjud bo'lsa, uni yangilash
                const updatedCompany = await Company.findOneAndUpdate(
                    { _id: existingCompany._id },
                    req.body,
                    { new: true }
                );
                return response.success(res, "Mavjud kompaniya yangilandi", updatedCompany);
            }
        } catch (error) {
            return response.error(res, "Kompaniya yaratish/yangilashda xatolik", [error.message], 500);
        }
    }

    // Kompaniyani o'chirish
    static async deleteCompany(req, res) {
        try {
            const company = await Company.findById(req.params.id);
            if (!company) {
                return response.error(res, "Kompaniya topilmadi", [], 404);
            }
            await Company.findByIdAndDelete(req.params.id);
            return response.success(res, "Kompaniya muvaffaqiyatli o'chirildi", null);
        } catch (error) {
            return response.error(res, "Kompaniya o'chirishda xatolik", [error.message], 500);
        }
    }
}

module.exports = CompanyController;