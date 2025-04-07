import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message, Modal, Button, Select, Table, Spin } from "antd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { EditOutlined, DeleteOutlined, FilePdfOutlined, FileExcelOutlined } from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchEmployees } from "../../../redux/slices/employeeSlice";
import {
  fetchDisciplinaryActions,
  addDisciplinaryAction,
  updateDisciplinaryAction,
  deleteDisciplinaryAction,
  setSelectedYear,
} from "../../../redux/slices/disciplinarySlice";
import {
  setFormData,
  resetFormData,
  setIsModalOpen,
  setEditData,
} from "../../../redux/slices/disciplinaryFormSlice";

const { Option } = Select;

const DisciplinaryActions = () => {
  const dispatch = useDispatch();
  const { employees } = useSelector((state) => state.employees);
  const { actions, filteredActions, selectedYear, status: disciplinaryStatus, error: disciplinaryError } =
    useSelector((state) => state.disciplinary);
  const { formData, isModalOpen, editData } = useSelector(
    (state) => state.disciplinaryForm
  );
  const { isDarkMode } = useSelector((state) => state.theme);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Tizimga kiring!", { position: "top-right", autoClose: 3000 });
      return;
    }

    dispatch(fetchEmployees());
    dispatch(fetchDisciplinaryActions());
  }, [dispatch, isAuthenticated]);

  console.log("Tanlangan yil (selectedYear):", selectedYear);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFormData({ [name]: value }));
  };

  const handleSelectChange = (value) => {
    const selectedEmployee = employees.find((emp) => emp._id === value);
    if (selectedEmployee) {
      dispatch(
        setFormData({
          employeeId: value,
          fullName: selectedEmployee.passportData.fullName,
          position: selectedEmployee.jobData.position,
        })
      );
    }
  };

  const handleEdit = (action) => {
    dispatch(setEditData(action));
    dispatch(
      setFormData({
        employeeId: action.employeeId,
        fullName: action.fullName,
        position: action.position,
        orderDetails: action.orderDetails,
        orderDate: action.orderDate ? action.orderDate.split("T")[0] : "",
        reason: action.reason,
      })
    );
    dispatch(setIsModalOpen(true));
  };

  const handleDelete = (id) => {
    dispatch(deleteDisciplinaryAction(id)).then((result) => {
      if (result.error) {
        toast.error(`Xatolik: ${result.payload}`);
      } else {
        toast.success("Jazo yozuvi muvaffaqiyatli o'chirildi!");
        dispatch(fetchDisciplinaryActions()); // O‘chirishdan so‘ng qayta yuklash
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId) {
      toast.error("Iltimos, xodimni tanlang!");
      return;
    }

    dispatch(addDisciplinaryAction(formData)).then((result) => {
      if (result.error) {
        toast.error(`Xatolik: ${result.payload}`);
      } else {
        toast.success("Ma'lumot muvaffaqiyatli qo‘shildi!");
        dispatch(resetFormData());
        dispatch(fetchDisciplinaryActions()); // Qo‘shishdan so‘ng qayta yuklash
      }
    });
  };

  const handleModalSubmit = async () => {
    const updatedData = {
      employeeId: formData.employeeId,
      fullName: formData.fullName,
      position: formData.position,
      orderDetails: formData.orderDetails,
      orderDate: formData.orderDate ? new Date(formData.orderDate).toISOString() : "",
      reason: formData.reason,
    };
    console.log("Yuborilayotgan updatedData:", updatedData);
    dispatch(
      updateDisciplinaryAction({ id: editData._id, formData: updatedData })
    ).then((result) => {
      if (result.error) {
        toast.error(`Xatolik: ${result.payload}`);
      } else {
        toast.success("Ma'lumot muvaffaqiyatli o‘zgartirildi!");
        dispatch(setIsModalOpen(false));
        dispatch(resetFormData());
        // Yangilangan orderDate yiliga mos selectedYear ni o‘rnatamiz
        if (updatedData.orderDate) {
          const updatedYear = new Date(updatedData.orderDate).getFullYear();
          dispatch(setSelectedYear(updatedYear));
        }
        // Ma'lumotlarni qayta yuklash
        dispatch(fetchDisciplinaryActions());
      }
    });
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text(
      "Intizomiy jazo berilgan xodimlar to‘g‘risida",
      doc.internal.pageSize.getWidth() / 2,
      20,
      { align: "center" }
    );
    doc.text("MA’LUMOT", doc.internal.pageSize.getWidth() / 2, 27, { align: "center" });

    const tableColumn = [
      "t/r",
      "Xodimning F.I.Sh.",
      "Lavozimi",
      "Intizomiy jazo (kim tomonidan, qachon berilgan va yurjik asosi)",
      "Izoh (sabab)",
    ];
    const tableRows = filteredActions.map((action, index) => [
      index + 1,
      action.fullName,
      action.position,
      action.orderDetails,
      action.reason,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        font: "times",
        textColor: [0, 0, 0],
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        halign: "left",
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 60 },
        4: { cellWidth: 40 },
      },
      margin: { top: 30, left: 10, right: 10 },
    });

    const finalY = doc.lastAutoTable.finalY + 30;
    doc.setFontSize(12);
    doc.setFont("Times New Roman", "normal");
    doc.text("Direktor", 14, finalY);
    doc.text("M.Nuritdinov", doc.internal.pageSize.getWidth() - 40, finalY, { align: "right" });
    doc.text("Inson resurslari bo‘limi boshlig‘i", 14, finalY + 10);
    doc.text("D.Aziova", doc.internal.pageSize.getWidth() - 40, finalY + 10, { align: "right" });

    doc.save("intizomiy_jazolar.pdf");
  };

  const downloadExcel = () => {
    const headerRows = [
      ["", "", "", "", ""],
      ["2024 yil davomida 'Andijon GES' filialida intizomiy jazo berilgan xodimlar to‘g‘risida MA’LUMOT"],
      ["", "", "", "", ""],
      ["", "", "", "", "12-jadval"],
    ];

    const tableHeader = [
      "№",
      "Xodimning F.I.Sh.",
      "Lavozimi",
      "Intizomiy jazo (kim tomonidan, qachon berilgan va yurjik asosi)",
      "Izoh (sabab)",
    ];

    const tableRows = filteredActions.map((action, index) => ({
      "№": index + 1,
      "Xodimning F.I.Sh.": action.fullName,
      "Lavozimi": action.position,
      "Intizomiy jazo (kim tomonidan, qachon berilgan va yurjik asosi)": action.orderDetails,
      "Izoh (sabab)": action.reason,
    }));

    const signatureRows = [
      ["", "", "", "", ""],
      ["Direktor", "", "", "", "M.Nuritdinov"],
      ["Inson resurslari bo‘limi boshlig‘i", "", "", "", "D.Aziova"],
    ];

    const worksheetData = [
      ...headerRows,
      tableHeader,
      ...tableRows.map((row) => Object.values(row)),
      ...signatureRows,
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet["!merges"] = [
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
      { s: { r: 3, c: 4 }, e: { r: 3, c: 4 } },
    ];

    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 20 },
      { wch: 50 },
      { wch: 30 },
    ];

    const headerRowIndex = 4;
    for (let col = 0; col < tableHeader.length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
      if (!worksheet[cellAddress]) worksheet[cellAddress] = { t: "s", v: tableHeader[col] };
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" }, name: "Times New Roman" },
        fill: { fgColor: { rgb: "0066CC" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };
    }

    tableRows.forEach((_, rowIndex) => {
      for (let col = 0; col < tableHeader.length; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex + 1 + rowIndex, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            font: { name: "Times New Roman" },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } },
            },
            alignment: { wrapText: true },
          };
        }
      }
    });

    for (let col = 0; col < 5; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 1, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { name: "Times New Roman" },
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
        };
      }
      const cellAddress3 = XLSX.utils.encode_cell({ r: 3, c: col });
      if (worksheet[cellAddress3]) {
        worksheet[cellAddress3].s = {
          font: { name: "Times New Roman" },
          alignment: { horizontal: "right", vertical: "center", wrapText: true },
        };
      }
    }

    signatureRows.forEach((_, rowIndex) => {
      for (let col = 0; col < 5; col++) {
        const cellAddress = XLSX.utils.encode_cell({
          r: headerRowIndex + tableRows.length + 1 + rowIndex,
          c: col,
        });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            font: { name: "Times New Roman" },
            alignment: { wrapText: true },
          };
        }
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Intizomiy Jazolar");
    XLSX.writeFile(workbook, "intizomiy_jazolar.xlsx");
  };

  if (disciplinaryStatus === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spin tip="Ma'lumotlar yuklanmoqda..." />
      </div>
    );
  }

  return (
    <div
      className={`p-6 rounded-lg shadow-md ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <ToastContainer />
      <h2 className="text-2xl font-bold text-blue-500 mb-6">Intizomiy Jazolar</h2>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <DatePicker
          selected={selectedYear ? new Date(selectedYear, 0, 1) : null}
          onChange={(date) => dispatch(setSelectedYear(date ? date.getFullYear() : null))}
          dateFormat="yyyy"
          showYearPicker
          placeholderText="Yilni tanlang"
          className="w-full sm:w-48 p-2 border rounded-md mb-4 sm:mb-0"
        />
        <Button
          onClick={() => dispatch(setSelectedYear(null))}
          className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white rounded-md px-4 py-2"
        >
          Filterni tozalash
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Select
              showSearch
              placeholder="Xodimni tanlang"
              optionFilterProp="children"
              onChange={handleSelectChange}
              value={formData.employeeId || undefined}
              className="w-full"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {employees.map((employee) => (
                <Option key={employee._id} value={employee._id}>
                  {employee.passportData.fullName} ({employee.jobData.position})
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <input
              type="text"
              name="fullName"
              placeholder="F.I.Sh"
              value={formData.fullName}
              onChange={handleChange}
              disabled
              required
              className="w-full p-2 border rounded-md bg-gray-100"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              name="position"
              placeholder="Lavozim"
              value={formData.position}
              onChange={handleChange}
              disabled
              required
              className="w-full p-2 border rounded-md bg-gray-100"
            />
          </div>
          <div>
            <input
              type="text"
              name="orderDetails"
              placeholder="Buyruq Tafsilotlari"
              value={formData.orderDetails}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              type="date"
              name="orderDate"
              value={formData.orderDate}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <input
              type="text"
              name="reason"
              placeholder="Sabab"
              value={formData.reason}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            type="primary"
            htmlType="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2"
          >
            Qo'shish
          </Button>
        </div>
      </form>

      {disciplinaryStatus === "failed" ? (
        <p className="text-center text-red-500">{disciplinaryError}</p>
      ) : (
        <Table
          columns={[
            {
              title: "№",
              dataIndex: "index",
              key: "index",
              render: (_, __, index) => index + 1,
            },
            {
              title: "F.I.Sh",
              dataIndex: "fullName",
              key: "fullName",
            },
            {
              title: "Lavozim",
              dataIndex: "position",
              key: "position",
            },
            {
              title: "Buyruq Tafsilotlari",
              dataIndex: "orderDetails",
              key: "orderDetails",
            },
            {
              title: "Buyruq Sanasi",
              dataIndex: "orderDate",
              key: "orderDate",
              render: (date) => {
                if (!date || isNaN(new Date(date))) {
                  return "Noma'lum sana";
                }
                return new Date(date).toLocaleDateString();
              },
            },
            {
              title: "Sabab",
              dataIndex: "reason",
              key: "reason",
            },
            {
              title: "Amallar",
              key: "action",
              render: (_, record) => (
                <div className="flex space-x-2">
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                  />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record._id)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-md"
                  />
                </div>
              ),
            },
          ]}
          dataSource={filteredActions}
          rowKey={(record, index) => record._id || `row-${index}`}
          pagination={{ pageSize: 10 }}
          bordered
          className={`${isDarkMode ? "ant-table-dark" : ""}`}
        />
      )}

      <div className="flex space-x-4 mt-6">
        <Button
          type="primary"
          icon={<FilePdfOutlined />}
          onClick={downloadPDF}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2"
        >
          PDF yuklab olish
        </Button>
        <Button
          type="default"
          icon={<FileExcelOutlined />}
          onClick={downloadExcel}
          className="bg-green-500 hover:bg-green-600 text-white rounded-md px-4 py-2"
        >
          Excel yuklab olish
        </Button>
      </div>

      <Modal
        title={<span className="text-blue-500">Ma'lumotni o'zgartirish</span>}
        open={isModalOpen}
        onOk={handleModalSubmit}
        onCancel={() => dispatch(setIsModalOpen(false))}
        okText="Saqlash"
        cancelText="Bekor qilish"
        okButtonProps={{ className: "bg-blue-500 hover:bg-blue-600" }}
        cancelButtonProps={{ className: "bg-gray-300 hover:bg-gray-400" }}
      >
        {editData && (
          <form onSubmit={(e) => { e.preventDefault(); handleModalSubmit(); }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Select
                  showSearch
                  placeholder="Xodimni tanlang"
                  optionFilterProp="children"
                  onChange={handleSelectChange}
                  value={formData.employeeId || undefined}
                  className="w-full"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {employees.map((employee) => (
                    <Option key={employee._id} value={employee._id}>
                      {employee.passportData.fullName} ({employee.jobData.position})
                    </Option>
                  ))}
                </Select>
              </div>
              <div>
                <input
                  type="text"
                  name="fullName"
                  placeholder="F.I.Sh"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled
                  required
                  className="w-full p-2 border rounded-md bg-gray-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="position"
                  placeholder="Lavozim"
                  value={formData.position}
                  onChange={handleChange}
                  disabled
                  required
                  className="w-full p-2 border rounded-md bg-gray-100"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="orderDetails"
                  placeholder="Buyruq Tafsilotlari"
                  value={formData.orderDetails}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="date"
                  name="orderDate"
                  value={formData.orderDate}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="reason"
                  placeholder="Sabab"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default DisciplinaryActions;