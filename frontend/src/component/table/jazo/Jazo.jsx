import React, { useState, useEffect } from "react";
import { message, Modal, Button, Select, Table, Spin } from "antd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DisciplinaryActions.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { EditOutlined, DeleteOutlined, FilePdfOutlined, FileExcelOutlined } from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Option } = Select;

const DisciplinaryActions = () => {
  const [actions, setActions] = useState([]);
  const [filteredActions, setFilteredActions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    fullName: "",
    position: "",
    orderDetails: "",
    orderDate: "",
    reason: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false); // `isModalVisible` o‘rniga `isModalOpen`
  const [editData, setEditData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  // Tokenni olish uchun umumiy funksiya
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Tizimga kiring!", { position: "top-right", autoClose: 3000 });
      return null;
    }
    return token;
  };

  // Xodimlar ro'yxatini olish
  const fetchEmployees = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch("http://localhost:5000/api/employees", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Xodimlar ro'yxatini olishda xatolik yuz berdi");
      }
      const data = await response.json();
      console.log("Olingan xodimlar:", data);
      setEmployees(data);
    } catch (error) {
      console.error("Xatolik:", error);
      toast.error("Xatolik: " + error.message);
    }
  };

  const fetchDisciplinaryData = async () => {
    const token = getToken();
    if (!token) return;
  
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/disciplinary", { // "/all" ni olib tashladik
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Server javobi statusi:", response.status);
      const responseText = await response.text();
      console.log("Server javobi texti:", responseText);
  
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          toast.error("Tizimga qayta kiring! Token yaroqsiz.", { position: "top-right", autoClose: 3000 });
          return;
        }
        throw new Error(`Server xatosi: ${response.status} - ${responseText}`);
      }
  
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : [];
      } catch (e) {
        throw new Error("Serverdan kelgan javob JSON emas: " + responseText.substring(0, 100));
      }
      console.log("Olingan intizomiy jazolar:", data);
      setActions(data);
      setFilteredActions(data);
    } catch (error) {
      console.error("Xatolik:", error);
      toast.error("Xatolik: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDisciplinaryData();
  }, []);

  useEffect(() => {
    if (!selectedYear) {
      setFilteredActions(actions);
      return;
    }

    const filtered = actions.filter((action) => {
      const actionYear = new Date(action.orderDate).getFullYear();
      return actionYear === selectedYear;
    });
    setFilteredActions(filtered);
  }, [selectedYear, actions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "employeeId") {
      const selectedEmployee = employees.find((emp) => emp._id === value);
      if (selectedEmployee) {
        setFormData({
          ...formData,
          employeeId: value,
          fullName: selectedEmployee.passportData.fullName,
          position: selectedEmployee.jobData.position,
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (value) => {
    const selectedEmployee = employees.find((emp) => emp._id === value);
    if (selectedEmployee) {
      setFormData({
        ...formData,
        employeeId: value,
        fullName: selectedEmployee.passportData.fullName,
        position: selectedEmployee.jobData.position,
      });
    }
  };

  const handleEdit = (action) => {
    setEditData(action);
    setFormData({
      employeeId: action.employeeId,
      fullName: action.fullName,
      position: action.position,
      orderDetails: action.orderDetails,
      orderDate: action.orderDate.split("T")[0],
      reason: action.reason,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/disciplinary/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP xatolik: ${response.status}`);
      }

      toast.success("Jazo yozuvi muvaffaqiyatli o'chirildi!");
      fetchDisciplinaryData();
    } catch (error) {
      console.error("Jazo yozuvini o'chirishda xatolik:", error);
      toast.error("Jazo yozuvini o'chirishda xatolik yuz berdi!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId) {
      toast.error("Iltimos, xodimni tanlang!");
      return;
    }
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch("http://localhost:5000/api/disciplinary/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ma'lumot qo'shishda xatolik yuz berdi");
      }
      toast.success("Ma'lumot muvaffaqiyatli qo‘shildi!");
      fetchDisciplinaryData();
      setFormData({
        employeeId: "",
        fullName: "",
        position: "",
        orderDetails: "",
        orderDate: "",
        reason: "",
      });
    } catch (error) {
      console.error("Xatolik:", error);
      toast.error("Xatolik: " + error.message);
    }
  };

  const handleModalSubmit = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/disciplinary/${editData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ma'lumotni yangilashda xatolik yuz berdi");
      }
      toast.success("Ma'lumot muvaffaqiyatli o‘zgartirildi!");
      setIsModalOpen(false);
      fetchDisciplinaryData();
      setFormData({
        employeeId: "",
        fullName: "",
        position: "",
        orderDetails: "",
        orderDate: "",
        reason: "",
      });
    } catch (error) {
      console.error("Xatolik:", error);
      toast.error("Xatolik: " + error.message);
    }
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

    const tableColumn = ["t/r", "Xodimning F.I.Sh.", "Lavozimi", "Intizomiy jazo (kim tomonidan, qachon berilgan va yurjik asosi)", "Izoh (sabab)"];
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
        const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex + tableRows.length + 1 + rowIndex, c: col });
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

  if (loading) return <Spin tip="Ma'lumotlar yuklanmoqda..." />;

  return (
    <div className="employee-container">
      <ToastContainer />
      <h2 style={{ color: "#1890ff", marginBottom: "20px" }}>Intizomiy Jazolar</h2>

      <div className="filter-container">
        <DatePicker
          selected={selectedYear ? new Date(selectedYear, 0, 1) : null}
          onChange={(date) => setSelectedYear(date ? date.getFullYear() : null)}
          dateFormat="yyyy"
          showYearPicker
          placeholderText="Yilni tanlang"
          className="date-picker"
        />
        <button onClick={() => setSelectedYear(null)}>Filterni tozalash</button>
      </div>

      <form className="disciplinary-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <Select
              showSearch
              placeholder="Xodimni tanlang"
              optionFilterProp="children"
              onChange={handleSelectChange}
              value={formData.employeeId || undefined}
              style={{ width: "100%" }}
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
          <div className="form-group">
            <input
              type="text"
              name="fullName"
              placeholder="F.I.Sh"
              value={formData.fullName}
              onChange={handleChange}
              disabled
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              name="position"
              placeholder="Lavozim"
              value={formData.position}
              onChange={handleChange}
              disabled
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="orderDetails"
              placeholder="Buyruq Tafsilotlari"
              value={formData.orderDetails}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <input
              type="date"
              name="orderDate"
              value={formData.orderDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="reason"
              placeholder="Sabab"
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit">Qo'shish</button>
        </div>
      </form>

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
            render: (date) => new Date(date).toLocaleDateString(),
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
              <div>
                <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ marginRight: 8 }} />
                <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} />
              </div>
            ),
          },
        ]}
        dataSource={filteredActions}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        bordered
        className="employee-table"
      />
      <div className="btn">
        <Button type="primary" icon={<FilePdfOutlined />} onClick={downloadPDF}>
          PDF yuklab olish
        </Button>
        <Button type="default" icon={<FileExcelOutlined />} onClick={downloadExcel}>
          Excel yuklab olish
        </Button>
      </div>
      <Modal
        title="Ma'lumotni o'zgartirish"
        open={isModalOpen}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            Bekor qilish
          </Button>,
          <Button key="submit" type="primary" onClick={handleModalSubmit}>
            Saqlash
          </Button>,
        ]}
      >
        {editData && (
          <form onSubmit={(e) => { e.preventDefault(); handleModalSubmit(); }}>
            <div className="form-row">
              <div className="form-group">
                <Select
                  showSearch
                  placeholder="Xodimni tanlang"
                  optionFilterProp="children"
                  onChange={(value) => {
                    const selectedEmployee = employees.find((emp) => emp._id === value);
                    if (selectedEmployee) {
                      setFormData({
                        ...formData,
                        employeeId: value,
                        fullName: selectedEmployee.passportData.fullName,
                        position: selectedEmployee.jobData.position,
                      });
                    }
                  }}
                  value={formData.employeeId || undefined}
                  style={{ width: "100%" }}
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
              <div className="form-group">
                <input
                  type="text"
                  name="fullName"
                  placeholder="F.I.Sh"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled
                  required
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  name="position"
                  placeholder="Lavozim"
                  value={formData.position}
                  onChange={handleChange}
                  disabled
                  required
                  style={{ width: "100%" }}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="orderDetails"
                  placeholder="Buyruq Tafsilotlari"
                  value={formData.orderDetails}
                  onChange={handleChange}
                  required
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <input
                  type="date"
                  name="orderDate"
                  value={formData.orderDate}
                  onChange={handleChange}
                  required
                  style={{ width: "100%" }}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="reason"
                  placeholder="Sabab"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  style={{ width: "100%" }}
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