import React, { useEffect } from "react"; // useEffect ni import qilamiz
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Checkbox, Row, Col } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginUser } from "../../redux/slices/authSlice";

const SignInPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, status, error } = useSelector((state) => state.auth);
  const { isDarkMode } = useSelector((state) => state.theme);
  const [form] = Form.useForm();

  // Token mavjudligini tekshirish va yo'naltirish
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  // Status o'zgarishlarini kuzatish
  useEffect(() => {
    if (status === "succeeded") {
      toast.success("Login muvaffaqiyatli!", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/");
    } else if (status === "failed" && error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [status, error, navigate]);

  // Agar token mavjud bo'lsa, hech narsa render qilinmaydi
  if (token) {
    return null;
  }

  const onFinish = async (values) => {
    dispatch(loginUser(values));
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? "bg-gray-900" : "bg-gray-100"
      } relative`}
    >
      <ToastContainer />
      {/* Overlay */}
      <div
        className={`absolute inset-0 ${
          isDarkMode ? "bg-gray-900/50" : "bg-gray-100/50"
        }`}
      ></div>
      {/* Card */}
      <div
        className={`relative z-10 p-8 rounded-lg shadow-lg w-full max-w-md ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* Close Button */}
        <div
          className={`absolute top-4 right-4 text-2xl cursor-pointer ${
            isDarkMode ? "text-gray-300 hover:text-gray-100" : "text-gray-600 hover:text-gray-800"
          }`}
        >
          ×
        </div>
        {/* Profile Icon */}
        <div
          className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
        >
          <UserOutlined className="text-4xl text-blue-500" />
        </div>
        {/* Title */}
        <h2 className="text-2xl font-semibold text-center text-blue-500 mb-6">Kirish</h2>
        {/* Form */}
        <Form
          form={form}
          name="login_form"
          onFinish={onFinish}
          layout="vertical"
          className="space-y-4"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Iltimos, username kiriting!" },
              { type: "string", message: "Iltimos, to'g'ri username kiriting!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
              className={isDarkMode ? "ant-input-dark" : ""}
            />
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
              className={isDarkMode ? "ant-input-dark" : ""}
            />
          </Form.Item>

          <Form.Item>
            <Row justify="space-between" align="middle">
              <Col>
                <Checkbox className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                  Eslab qolish
                </Checkbox>
              </Col>
              <Col>
                <Link
                  to="/forgot-password"
                  className={`${
                    isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
                  }`}
                >
                  Parolni unutdingizmi?
                </Link>
              </Col>
            </Row>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              loading={status === "loading"}
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