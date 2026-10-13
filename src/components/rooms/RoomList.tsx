import { useEffect, useState } from "react";
import { getRooms, createRoom } from "../../api/chat";
import { searchUsers } from "../../api/auth";

const RoomList = ({ onSelectRoom }: any) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [loading, setLoading] = useState(false);

  const fetchRooms = async () => {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch {
      console.error("Failed to load rooms");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Debounce search
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      try {
        const res = await searchUsers(query);
        setResults(res.results || res);
        setShowDropdown(true);
      } catch {
        console.error("User search failed");
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  // Toggle user
  const toggleUser = (user: any) => {
    const exists = selectedUsers.find((u) => u.id === user.id);
    if (exists) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;

    try {
      setLoading(true);
      await createRoom({
        name: roomName,
        description: description || "Team discussion",
        is_private: isPrivate,
        members: selectedUsers.map((u) => u.id),
      });

      // Reset form
      setRoomName("");
      setDescription("");
      setSelectedUsers([]);
      setQuery("");
      setResults([]);
      setShowCreateModal(false);
      
      // Refresh room list
      fetchRooms();
    } catch {
      console.error("Room creation failed");
      alert("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRoomName("");
    setDescription("");
    setSelectedUsers([]);
    setQuery("");
    setResults([]);
    setIsPrivate(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  return (
    <div className="w-1/3 bg-gray-900 p-4 border-r border-gray-700 overflow-y-auto h-screen">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg text-white">Rooms</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          + Create Room
        </button>
      </div>

      <div>
        {rooms.length === 0 && <p className="text-gray-400">No rooms yet</p>}
        {rooms.map((room) => (
          <div
            key={room.id}
            onClick={() => onSelectRoom(room.id)}
            className="p-2 hover:bg-gray-800 cursor-pointer rounded text-white"
          >
            <div className="font-medium">{room.name}</div>
            {room.description && (
              <div className="text-xs text-gray-400 mt-1">{room.description}</div>
            )}
          </div>
        ))}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-96 max-w-md relative">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>

            <h3 className="text-lg font-semibold mb-4 text-white pr-6">Create New Room</h3>

            <div className="space-y-4">
              <input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Room name *"
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
              />

              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
              />

              {/* User Search */}
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => results.length && setShowDropdown(true)}
                  placeholder="Search users to add..."
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                />

                {showDropdown && (
                  <div className="absolute w-full bg-gray-800 border border-gray-700 mt-1 max-h-40 overflow-y-auto rounded z-10">
                    {results.length === 0 ? (
                      <div className="p-2 text-gray-400">No users found</div>
                    ) : (
                      results.map((user) => (
                        <label
                          key={user.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-700 cursor-pointer text-white"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.some((u) => u.id === user.id)}
                            onChange={() => toggleUser(user)}
                            className="mr-2"
                          />
                          <div>
                            <div className="font-medium">{user.username || user.name}</div>
                            {user.email && <div className="text-xs text-gray-400">{user.email}</div>}
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    Selected Users ({selectedUsers.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <span
                        key={user.id}
                        className="bg-blue-600 px-2 py-1 rounded text-sm text-white flex items-center gap-1"
                      >
                        {user.username || user.name}
                        <button
                          onClick={() => toggleUser(user)}
                          className="hover:text-gray-300 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Private Room Toggle */}
              <label className="flex items-center text-white">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="mr-2"
                />
                <span>Private Room</span>
              </label>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCreateRoom}
                  disabled={!roomName.trim() || loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded text-white disabled:opacity-50 transition-colors"
                >
                  {loading ? "Creating..." : "Create Room"}
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;