import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchDocuments, resetDocumentsState } from "../../../redux/slices/employeeSlice";

const Files = ({ employeeId }) => {
  const dispatch = useDispatch();
  const { documents, documentsStatus, documentsError } = useSelector(
    (state) => state.employees
  );
  const { isDarkMode } = useSelector((state) => state.theme);

  useEffect(() => {
    dispatch(fetchDocuments(employeeId));

    // Komponent unmount bo‘lganda state’ni tozalash
    return () => {
      dispatch(resetDocumentsState());
    };
  }, [dispatch, employeeId]);

  useEffect(() => {
    if (documentsStatus === "failed" && documentsError) {
      toast.error(`❌ Xatolik: ${documentsError}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [documentsStatus, documentsError]);

  const openFile = (filePath) => {
    if (!filePath) {
      toast.error("Fayl yo'li noto'g'ri!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    try {
      const fullUrl = `http://localhost:5000${filePath.startsWith("/") ? "" : "/"}${filePath}`;
      window.open(fullUrl, "_blank"); // Faylni yangi tabda ochish
    } catch (error) {
      console.error("Faylni ochishda xatolik:", error);
      toast.error("Faylni ochishda xatolik yuz berdi!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div
      className={`p-6 rounded-lg shadow-md ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <ToastContainer />
      <h1 className="text-2xl font-semibold text-blue-500 mb-5">
        Fayllarni Ko‘rish
      </h1>
      <div className="flex flex-col gap-4">
        {documentsStatus === "loading" ? (
          <p className="text-gray-500 dark:text-gray-400">Yuklanmoqda...</p>
        ) : documentsStatus === "failed" && documentsError ? (
          <p className="text-red-500">{documentsError}</p>
        ) : documents.length > 0 ? (
          documents.map((file, index) => (
            <div
              key={index}
              className={`flex justify-between items-center p-4 rounded-md shadow-sm ${
                isDarkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <h3 className="text-lg font-medium">
                {file.fileName || file.name || "Noma'lum fayl"}
              </h3>
              <button
                onClick={() => openFile(file.filePath)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-md transition-colors"
              >
                Ko‘rish
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Fayllar mavjud emas</p>
        )}
      </div>
    </div>
  );
};

export default Files;