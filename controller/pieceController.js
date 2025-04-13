const Piece = require("../model/piece");
const responses = require("../utils/response");

class PieceController {
  async createPiece(req, res) {
    try {
      const piece = new Piece(req.body);
      await piece.save();
      if (!piece) return responses.error(res, "Xatolik yuz berdi");
      responses.created(res, "Muvaffaqiyatli saqlandi", piece);
    } catch (error) {
      responses.serverError(res, error.message);
    }
  }

  async getAllPieces(req, res) {
    try {
      const pieces = await Piece.find();
      if (!pieces) return responses.notFound(res, "Topilmadi");
      responses.success(res, "Muvaffaqiyatli olindi", pieces);
    } catch (error) {
      responses.serverError(res, error.message);
    }
  }

  async getPieceById(req, res) {
    try {
      const piece = await Piece.findById(req.params.id);
      if (!piece) return responses.notFound(res, "Topilmadi");
      res.json(piece);
    } catch (error) {
      responses.serverError(res, error.message);
    }
  }

  async updatePiece(req, res) {
    try {
      const piece = await Piece.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!piece) return responses.notFound(res, "Topilmadi");
      responses.success(res, "yangilandi", piece);
    } catch (error) {
      responses.serverError(res, error.message);
    }
  }

  async deletePiece(req, res) {
    try {
      const piece = await Piece.findByIdAndDelete(req.params.id);
      if (!piece) return responses.notFound(res, "Topilmadi");
      responses.success(res, "Muvaffaqiyatli o'chirildi", piece);
    } catch (error) {
      responses.serverError(res, error.message);
    }
  }
}

module.exports = new PieceController();
