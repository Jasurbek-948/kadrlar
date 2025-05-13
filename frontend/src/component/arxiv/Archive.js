import React, { useEffect, useState } from "react";
import { Table, Spin, message, Modal, Descriptions, Typography, Divider } from "antd";
import { UserOutlined, ProfileOutlined, BookOutlined, InfoCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import "./Archive.css"; // Yangi CSS faylni import qilamiz

const { Title, Text } = Typography;
// 
const Archive = () => {
  const [archivedData, setArchivedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchArchivedData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/archive/employees/archived", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP xatolik: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      console.log("Arxivdan olingan ma'lumotlar:", result);
      setArchivedData(result);
    } catch (error) {
      console.error("Arxivdagi ma'lumotlarni olishda xatolik:", error);
      message.error("Arxiv ma'lumotlarini olishda xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedData();
  }, []);

  const columns = [
    {
      title: "№",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "F.I.O",
      dataIndex: ["passportData", "fullName"],
      key: "fullName",
    },
    {
      title: "Lavozim",
      dataIndex: ["jobData", "position"],
      key: "position",
    },
    {
      title: "Bo'lim",
      dataIndex: ["jobData", "department"],
      key: "department",
    },
    {
      title: "Ishga Kirgan Sana",
      dataIndex: ["jobData", "hireDate"],
      key: "hireDate",
      render: (text) => (text ? moment(text).format("DD.MM.YYYY") : "Noma'lum"),
    },
    {
      title: "Ishdan Chiqib Ketgan Sana",
      dataIndex: "archiveDate",
      key: "archiveDate",
      render: (text) => (text ? moment(text).format("DD.MM.YYYY") : "Noma'lum"),
    },
  ];

  const showEmployeeDetails = (employee) => {
    setSelectedEmployee(employee);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="archive-container">
      <div className="table-header">
        <h2 style={{ color: "#1890ff", marginBottom: "20px" }}>Arxivdagi Xodimlar</h2>
      </div>
      {loading ? (
        <div className="loading-container">
          <Spin size="large" tip="Ma'lumotlar yuklanmoqda..." />
        </div>
      ) : archivedData.length === 0 ? (
        <p className="empty-message">Arxivda xodimlar mavjud emas.</p>
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={archivedData}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
            onRow={(record) => ({
              onClick: () => showEmployeeDetails(record),
              style: { cursor: "pointer" },
            })}
            className="employee-table" // Yangi styling uchun className qo'shildi
          />
          <Modal
            title={<Title level={4}>{selectedEmployee?.passportData.fullName || "Xodim Ma'lumotlari"}</Title>}
            open={isModalVisible}
            onCancel={handleModalCancel}
            footer={null}
            width={800}
            style={{ top: 20 }}
          >
            {selectedEmployee && (
              <div className="employee-details-modal">
                {/* Shaxsiy Ma'lumotlar */}
                <Divider orientation="left">
                  <UserOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                  Shaxsiy Ma'lumotlar
                </Divider>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="F.I.O">{selectedEmployee.passportData.fullName}</Descriptions.Item>
                  <Descriptions.Item label="Telefon Raqami">{selectedEmployee.passportData.phoneNumber || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="INN">{selectedEmployee.passportData.inn || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="INSP">{selectedEmployee.passportData.insp || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Manzil">{selectedEmployee.passportData.address || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Passport Seriyasi">{selectedEmployee.passportData.passportSeries || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Passport Raqami">{selectedEmployee.passportData.passportNumber || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Kim Tarafidan Berilgan">{selectedEmployee.passportData.issuedBy || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Berilgan Sana">{selectedEmployee.passportData.issuedDate || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Tug'ilgan Sana">{selectedEmployee.passportData.birthDate || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Jinsi">{selectedEmployee.passportData.gender || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Tug'ilgan Joyi">{selectedEmployee.passportData.birthPlace || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Millati">{selectedEmployee.passportData.nationality || "Noma'lum"}</Descriptions.Item>
                </Descriptions>

                {/* Ish Ma'lumotlari */}
                <Divider orientation="left">
                  <ProfileOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                  Ish Ma'lumotlari
                </Divider>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Bo'lim">{selectedEmployee.jobData.department || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Lavozim">{selectedEmployee.jobData.position || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Razryadi">{selectedEmployee.jobData.grade || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Maoshi">{selectedEmployee.jobData.salary || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Bandlik Yo'llanmasi">{selectedEmployee.jobData.employmentContract || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Ishga Kirgan Sana">{selectedEmployee.jobData.hireDate ? moment(selectedEmployee.jobData.hireDate).format("DD.MM.YYYY") : "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Buyruq Raqami">{selectedEmployee.jobData.orderNumber || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Ishdan Chiqib Ketgan Sana">{selectedEmployee.archiveDate ? moment(selectedEmployee.archiveDate).format("DD.MM.YYYY") : "Noma'lum"}</Descriptions.Item>
                </Descriptions>

                {/* Ta'lim Ma'lumotlari */}
                <Divider orientation="left">
                  <BookOutlined style={{ marginRight: 8, color: "#fa8c16" }} />
                  Ta'lim Ma'lumotlari
                </Divider>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Ta'lim Darajasi">{selectedEmployee.educationData.educationLevel || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Ta'lim Muassasasi">{selectedEmployee.educationData.institution || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Mutaxassislik">{selectedEmployee.educationData.specialty || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Bitiruv Yili">{selectedEmployee.educationData.graduationYear || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Diplom Raqami">{selectedEmployee.educationData.diplomaNumber || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Akademik Unvon">{selectedEmployee.educationData.academicTitle || "Yo'q"}</Descriptions.Item>
                </Descriptions>

                {/* Qo'shimcha Ma'lumotlar */}
                <Divider orientation="left">
                  <InfoCircleOutlined style={{ marginRight: 8, color: "#f5222d" }} />
                  Qo'shimcha Ma'lumotlar
                </Divider>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Ta'til Holati">{selectedEmployee.vacationStatus || "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Ta'til Boshlanish Sana">{selectedEmployee.vacationStart ? moment(selectedEmployee.vacationStart).format("DD.MM.YYYY") : "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Ta'til Tugash Sana">{selectedEmployee.vacationEnd ? moment(selectedEmployee.vacationEnd).format("DD.MM.YYYY") : "Noma'lum"}</Descriptions.Item>
                  <Descriptions.Item label="Hujjatlar">{selectedEmployee.documents.length > 0 ? selectedEmployee.documents.map(doc => doc.fileName).join(", ") : "Hujjatlar mavjud emas"}</Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default Archive;