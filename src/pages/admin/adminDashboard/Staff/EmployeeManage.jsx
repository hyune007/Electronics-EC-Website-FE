import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useEmployeeLogic } from "./EmployeeLogic.js";
import EmployeeForm from "./EmployeeForm.jsx";
import "./Employee.css";

export default function EmployeeManage() {
  const nv = useEmployeeLogic();

  return (
    <div className=".employee-manage">
      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Tìm theo tên hoặc SĐT..."
            value={nv.search}
            onChange={(e) => nv.setSearch(e.target.value)}
          />
        </div>
        <button className="btn-add" onClick={nv.openAdd}>
          <Plus size={16} /> Thêm nhân viên
        </button>
      </div>

      {/* TABLE */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Họ tên</th>
              <th>SĐT</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {nv.filteredEmployees.map((e) => (
              <tr key={e.nv_id}>
                <td>{e.nv_id}</td>
                <td>{e.nv_name}</td>
                <td>{e.nv_phone}</td>
                <td>{e.nv_mail}</td>
                <td>
                  <span className={`role ${e.nv_role.toLowerCase()}`}>
                    {e.nv_role}
                  </span>
                </td>
                <td className="action">
                  <button onClick={() => nv.openEdit(e)}>
                    <Pencil size={14} />
                  </button>
                  <button
                    className="danger"
                    onClick={() => nv.handleDelete(e.nv_id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {nv.filteredEmployees.length === 0 && (
              <tr>
                <td colSpan="6" className="empty">
                  Không có nhân viên
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <EmployeeForm
        open={nv.openForm}
        onClose={() => nv.setOpenForm(false)}
        onSubmit={{
          form: nv.form,
          setForm: nv.setForm,
          handleSubmit: nv.handleSubmit,
        }}
      />
    </div>
  );
}
