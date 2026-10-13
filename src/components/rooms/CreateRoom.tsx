import { useEffect, useState } from "react";
import { createRoom } from "../../api/chat";
import { searchUsers } from "../../api/auth";

const CreateRoom = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ debounce search
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

  // ✅ toggle user
  const toggleUser = (user: any) => {
    const exists = selectedUsers.find((u) => u.id === user.id);

    if (exists) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreate = async () => {
    await createRoom({
      name: name || "new room",
      description: description || "Team discussion 33",
      is_private: isPrivate,
      members: selectedUsers.map((u) => u.id),
    });

    setName("");
    setDescription("");
    setSelectedUsers([]);
    setQuery("");
    setResults([]);
  };

  return (
    <div>
      <input
        placeholder="Room name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* 🔍 SEARCH */}
      <div className="relative mb-2">
        <input
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setShowDropdown(true)}
        />

        {showDropdown && (
          <div className="absolute w-full bg-gray-200 border mt-1 max-h-40 overflow-y-auto">
            {results.length === 0 ? (
              <div>No users found</div>
            ) : (
              results.map((user) => {
                const checked = selectedUsers.some(
                  (u) => u.id === user.id
                );

                return (
                  <label key={user.id} style={{ display: "block" }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleUser(user)}
                    />
                    {user.name}
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ✅ SELECTED USERS */}
      <div>
        {selectedUsers.map((user) => (
          <span key={user.id}>
            {user.name}
            <button onClick={() => toggleUser(user)}>x</button>
          </span>
        ))}
      </div>

      <label>
        Private:
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
        />
      </label>

      <button onClick={handleCreate}>Create</button>
    </div>
  );
};

export default CreateRoom;