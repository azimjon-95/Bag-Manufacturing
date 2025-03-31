const Piece = require("../model/piece");

class PieceController {
    async createPiece(req, res) {
        try {
            const piece = new Piece(req.body);
            await piece.save();
            res.status(201).json(piece);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAllPieces(req, res) {
        try {
            const pieces = await Piece.find();
            res.json(pieces);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getPieceById(req, res) {
        try {
            const piece = await Piece.findById(req.params.id);
            if (!piece) return res.status(404).json({ message: "Topilmadi" });
            res.json(piece);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updatePiece(req, res) {
        try {
            const piece = await Piece.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
            });
            if (!piece) return res.status(404).json({ message: "Topilmadi" });
            res.json(piece);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async deletePiece(req, res) {
        try {
            const piece = await Piece.findByIdAndDelete(req.params.id);
            if (!piece) return res.status(404).json({ message: "Topilmadi" });
            res.json({ message: "O'chirildi" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new PieceController();