const DisciplinaryAction = require("../models/disciplinaryActionSchema");

const addDisciplinaryAction = async (req, res) => {
  try {
    const { employeeId, fullName, position, orderDetails, orderDate, reason } = req.body;
    const action = new DisciplinaryAction({ employeeId, fullName, position, orderDetails, orderDate, reason });
    await action.save();
    res.status(201).json(action);
  } catch (error) {
    console.error("Intizomiy jazoni qo'shishda xatolik:", error);
    res.status(500).json({ error: "Intizomiy jazoni qo'shishda xatolik!" });
  }
};

const getDisciplinaryActions = async (req, res) => {
  try {
    const actions = await DisciplinaryAction.find();
    res.status(200).json(actions);
  } catch (error) {
    console.error("Intizomiy jazolarni olishda xatolik:", error);
    res.status(500).json({ error: "Intizomiy jazolarni olishda xatolik!" });
  }
};

const getDisciplinaryActionById = async (req, res) => {
  try {
    const { id } = req.params;
    const action = await DisciplinaryAction.findById(id);
    if (!action) {
      return res.status(404).json({ error: "Intizomiy jazo topilmadi!" });
    }
    res.status(200).json(action);
  } catch (error) {
    console.error("Intizomiy jazoni olishda xatolik:", error);
    res.status(500).json({ error: "Intizomiy jazoni olishda xatolik!" });
  }
};

const updateDisciplinaryAction = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const updatedAction = await DisciplinaryAction.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedAction) {
      return res.status(404).json({ error: "Intizomiy jazo topilmadi!" });
    }
    res.status(200).json(updatedAction);
  } catch (error) {
    console.error("Intizomiy jazoni yangilashda xatolik:", error);
    res.status(500).json({ error: "Intizomiy jazoni yangilashda xatolik!" });
  }
};

const deleteDisciplinaryAction = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAction = await DisciplinaryAction.findByIdAndDelete(id);
    if (!deletedAction) {
      return res.status(404).json({ error: "Intizomiy jazo topilmadi!" });
    }
    res.status(200).json({ message: "Intizomiy jazo muvaffaqiyatli o'chirildi!" });
  } catch (error) {
    console.error("Intizomiy jazoni o'chirishda xatolik:", error);
    res.status(500).json({ error: "Intizomiy jazoni o'chirishda xatolik!" });
  }
};

module.exports = {
  addDisciplinaryAction,
  getDisciplinaryActions,
  getDisciplinaryActionById,
  updateDisciplinaryAction,
  deleteDisciplinaryAction,
};