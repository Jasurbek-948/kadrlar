import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Row, Col } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./SignInPage.css";

const SignInPage = ({ onLogin }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Token mavjud bo'lsa, asosiy sahifaga yo'naltirishni render jarayonida qilamiz
  const token = localStorage.getItem("token");
  if (token) {
    return null; // useEffect o'rniga shu joyda navigatsiyani boshqaramiz
  }

  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log("Yuborilayotgan qiymatlar:", values);
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      console.log("Server javobi:", data);
      if (response.ok) {
        toast.success("Login muvaffaqiyatli!");
        localStorage.setItem("token", data.token);
        if (onLogin) onLogin(data.token);
        navigate("/"); // Faqat login muvaffaqiyatli bo'lganda navigatsiya
      } else {
        toast.error(data.error || "Login xatosi!");
      }
    } catch (error) {
      console.error("Xatolik:", error);
      toast.error("Server bilan bog'lanishda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sign-in-container">
      <div className="sign-in-overlay"></div>
      <div className="sign-in-card">
        <div className="close-btn">×</div>
        <div className="profile-icon"></div>
        <h2>Kirish</h2>
        <Form
          form={form}
          name="login_form"
          onFinish={onFinish}
          layout="vertical"
          className="sign-in-form"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Iltimos, username kiriting!" },
              { type: "string", message: "Iltimos, to'g'ri username kiriting!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Iltimos, parol kiriting!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Parol"
              size="large"
              iconRender={(visible) => (visible ? <LockOutlined /> : <LockOutlined />)}
            />
          </Form.Item>

          <Form.Item>
            <Row justify="space-between" align="middle">
              <Col>
                <Checkbox>Eslab qolish</Checkbox>
              </Col>
              <Col>
                <Link to="/forgot-password">Parolni unutdingizmi?</Link>
              </Col>
            </Row>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              className="sign-in-button"
              loading={loading}
            >
              Kirish
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default SignInPage;