import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  logoutUser,
  updatePassword,
  updateProfile,
} from "../api/auth";
import ChatPage from "./ChatPage";

type Profile = {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  status?: string;
};

type ProfileModal = "view" | "update-profile" | "update-password" | null;

type ModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="text-lg font-semibold text-slate-950">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close modal"
          >
            x
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("online");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ProfileModal>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setUsername(data.username || "");
        setStatus(data.status || "online");
      } catch (error) {
        console.error(error);
      }
    }

    loadProfile();
  }, []);

  const openModal = (modal: ProfileModal) => {
    setActiveModal(modal);
    setDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch {
      alert("Logout failed");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setProfileLoading(true);
      const data = await updateProfile({
        first_name: firstName,
        last_name: lastName,
        username,
        status,
      });

      setProfile(
        data || {
          ...profile,
          first_name: firstName,
          last_name: lastName,
          username,
          status,
        }
      );
      setActiveModal(null);
    } catch {
      alert("Profile update failed");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setPasswordLoading(true);
      await updatePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });

      setOldPassword("");
      setNewPassword("");
      setActiveModal(null);
      alert("Password updated");
    } catch {
      alert("Password update failed");
    } finally {
      setPasswordLoading(false);
    }
  };

  const displayName =
    profile?.first_name || profile?.username || profile?.email || "Profile";

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-950">
      <nav className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
        <div>
          <div className="text-xl font-bold leading-tight text-slate-950">
            Chatroom
          </div>
          <div className="text-xs font-medium text-slate-500">
            Rooms and messages
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((open) => !open)}
            className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-2 pl-2 pr-4 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <span className="hidden max-w-[150px] truncate sm:inline">
              {displayName}
            </span>
            <span className="text-slate-400">v</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 text-sm shadow-xl">
              <button
                type="button"
                onClick={() => openModal("view")}
                className="block w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50"
              >
                View Profile
              </button>
              <button
                type="button"
                onClick={() => openModal("update-profile")}
                className="block w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50"
              >
                Update Profile
              </button>
              <button
                type="button"
                onClick={() => openModal("update-password")}
                className="block w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50"
              >
                Update Password
              </button>
              <div className="my-2 border-t border-slate-100" />
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left font-semibold text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <section className="min-h-0 flex-1 overflow-hidden">
        <ChatPage />
      </section>

      {activeModal === "view" && (
        <Modal title="Profile" onClose={() => setActiveModal(null)}>
          {profile ? (
            <div className="space-y-3 text-sm text-slate-700">
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <span className="font-semibold text-slate-950">Email:</span>{" "}
                {profile.email || "-"}
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <span className="font-semibold text-slate-950">Username:</span>{" "}
                {profile.username || "-"}
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <span className="font-semibold text-slate-950">
                  First Name:
                </span>{" "}
                {profile.first_name || "-"}
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <span className="font-semibold text-slate-950">
                  Last Name:
                </span>{" "}
                {profile.last_name || "-"}
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <span className="font-semibold text-slate-950">Status:</span>{" "}
                {profile.status || "-"}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Loading profile...</p>
          )}
        </Modal>
      )}

      {activeModal === "update-profile" && (
        <Modal title="Update Profile" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <input
              className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <input
              className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <select
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="online">online</option>
              <option value="offline">offline</option>
              <option value="away">away</option>
              <option value="busy">busy</option>
            </select>
            <button
              className="h-11 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={profileLoading}
            >
              {profileLoading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </Modal>
      )}

      {activeModal === "update-password" && (
        <Modal title="Update Password" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <input
              className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              type="password"
              placeholder="Old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <input
              className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              className="h-11 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={passwordLoading}
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Home;
