import { useAuth } from '../contexts/AuthContext';

export const UserInfo = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Thông tin người dùng</h2>
      <div className="space-y-2">
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Tên:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Vai trò:</strong> {user.role}</p>
        {user.dealerId && <p><strong>Dealer ID:</strong> {user.dealerId}</p>}
        {user.dealerName && <p><strong>Tên đại lý:</strong> {user.dealerName}</p>}
      </div>
      <button
        onClick={logout}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Đăng xuất
      </button>
    </div>
  );
};
