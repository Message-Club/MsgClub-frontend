import { useState, useEffect, ReactNode } from "react";
import { addUsersToRoom, updateRoom, deleteRoom, getRoom } from "../../api/chat";
import { searchUsers } from "../../api/auth";

// Types
export type RoomMember = {
  id: string | number;
  role: string;
  joinedAt: string;
  roomId: string;
  userId: string;
  user: {
    id: string | number;
    email: string;
    username: string;
  };
};

export type RoomDetails = {
  id: string | number;
  name: string;
  isGroup: boolean;
  createdAt: string;
  members: RoomMember[];
};

export type User = {
  id: number;
  username?: string;
  email?: string;
  name?: string;
  [key: string]: any;
};

export type RoomActionsConfig = {
  enableAddMembers?: boolean;
  enableUpdateRoom?: boolean;
  enableDeleteRoom?: boolean;
  enableRoomInfo?: boolean;
  
  labels?: {
    addMembers?: string;
    updateRoom?: string;
    deleteRoom?: string;
    roomInfo?: string;
    members?: string;
    member?: string;
    add?: string;
    cancel?: string;
    update?: string;
    delete?: string;
    confirmDelete?: string;
    deleteWarning?: string;
    searchPlaceholder?: string;
    noUsersFound?: string;
    typeToSearch?: string;
    currentMembers?: string;
    usersToAdd?: string;
    updateRoomName?: string;
    enterRoomName?: string;
    roomName?: string;
    created?: string;
    groupChat?: string;
    directMessage?: string;
    joined?: string;
    role?: string;
    admin?: string;
  };
  
  renderRoomIcon?: () => ReactNode;
  renderAddIcon?: () => ReactNode;
  renderEditIcon?: () => ReactNode;
  renderDeleteIcon?: () => ReactNode;
  renderInfoIcon?: () => ReactNode;
  renderWarningIcon?: () => ReactNode;
  renderMemberAvatar?: (member: RoomMember) => ReactNode;
  
  onBeforeAddMembers?: (roomId: number, userIds: number[]) => Promise<boolean> | boolean;
  onBeforeUpdateRoom?: (roomId: number, data: any) => Promise<boolean> | boolean;
  onBeforeDeleteRoom?: (roomId: number) => Promise<boolean> | boolean;
  
  className?: string;
  modalClassName?: string;
  buttonClassName?: string;
  roomInfoModalSize?: {
    width?: string;
    height?: string;
    maxWidth?: string;
    maxHeight?: string;
  };
  addMembersModalSize?: {
    width?: string;
    height?: string;
    maxWidth?: string;
    maxHeight?: string;
  };
  
  fetchAdditionalRoomData?: (roomId: number) => Promise<Partial<RoomDetails>>;
};

type RoomActionsNavProps = {
  roomId: number;
  config?: RoomActionsConfig;
  onRoomUpdated?: (room?: RoomDetails) => void;
  onRoomDeleted?: () => void;
  onError?: (error: Error, action: string) => void;
  onMembersAdded?: (members: User[]) => void;
};

// Default icons
const DefaultRoomIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DefaultAddIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const DefaultEditIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DefaultDeleteIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const DefaultInfoIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DefaultWarningIcon = () => (
  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const RoomActionsNav = ({ 
  roomId, 
  config = {}, 
  onRoomUpdated, 
  onRoomDeleted,
  onError,
  onMembersAdded 
}: RoomActionsNavProps) => {
  const {
    enableAddMembers = true,
    enableUpdateRoom = true,
    enableDeleteRoom = true,
    enableRoomInfo = true,
    labels = {},
    renderRoomIcon,
    renderAddIcon,
    renderEditIcon,
    renderDeleteIcon,
    renderInfoIcon,
    renderWarningIcon,
    renderMemberAvatar,
    onBeforeAddMembers,
    onBeforeUpdateRoom,
    onBeforeDeleteRoom,
    className = "",
    modalClassName = "",
    buttonClassName = "",
    roomInfoModalSize = {
      width: "w-[700px]",
      height: "h-[600px]",
      maxWidth: "max-w-[90vw]",
      maxHeight: "max-h-[90vh]"
    },
    addMembersModalSize = {
      width: "w-[500px]",
      height: "h-[550px]",
      maxWidth: "max-w-[90vw]",
      maxHeight: "max-h-[90vh]"
    },
    fetchAdditionalRoomData,
  } = config;

  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showUpdateRoom, setShowUpdateRoom] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [roomName, setRoomName] = useState("");
  const [currentRoomName, setCurrentRoomName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [additionalData, setAdditionalData] = useState<any>(null);

  // Fetch room details and members
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const room = await getRoom(roomId);
        
        let members: RoomMember[] = [];
        
        if (room.members) {
          members = room.members;
        } else if (room.room_members) {
          members = room.room_members;
        }
        
        setCurrentRoomName(room.name);
        setRoomMembers(members);
        setRoomDetails(room);
        
        if (fetchAdditionalRoomData) {
          const extraData = await fetchAdditionalRoomData(roomId);
          setAdditionalData(extraData);
        }
      } catch (error) {
        console.error("Failed to fetch room details", error);
        onError?.(error as Error, "fetchRoomDetails");
      }
    };
    
    if (roomId) {
      fetchRoomDetails();
    }
  }, [roomId, fetchAdditionalRoomData]);

  // Debounced user search
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      try {
        const res = await searchUsers(query);
        const users = res.results || res;
        
        const availableUsers = users.filter((user: User) => {
          return !roomMembers.some(member => {
            const memberId = member.user?.id || member.id;
            return Number(memberId) === Number(user.id);
          });
        });
        
        setResults(availableUsers);
        setShowDropdown(true);
      } catch (error) {
        console.error("User search failed", error);
        onError?.(error as Error, "searchUsers");
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query, roomMembers]);

  const toggleUser = (user: User) => {
    const exists = selectedUsers.find((u) => u.id === user.id);
    if (exists) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      if (onBeforeAddMembers) {
        const shouldProceed = await onBeforeAddMembers(roomId, selectedUsers.map(u => u.id));
        if (!shouldProceed) return;
      }

      setLoading(true);
      await addUsersToRoom(
        roomId,
        selectedUsers.map((u) => u.id)
      );
      
      onMembersAdded?.(selectedUsers);
      setSelectedUsers([]);
      setQuery("");
      setShowAddMembers(false);
      
      const updatedRoom = await getRoom(roomId);
      const updatedMembers = updatedRoom.members || updatedRoom.room_members || [];
      setRoomMembers(updatedMembers);
      setRoomDetails(updatedRoom);
      
      onRoomUpdated?.(updatedRoom);
    } catch (error) {
      console.error("Failed to add members", error);
      onError?.(error as Error, "addMembers");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoom = async () => {
    if (!roomName.trim()) return;

    try {
      if (onBeforeUpdateRoom) {
        const shouldProceed = await onBeforeUpdateRoom(roomId, { name: roomName, isGroup: true });
        if (!shouldProceed) return;
      }

      setLoading(true);
      await updateRoom(roomId, {
        name: roomName,
        isGroup: true,
      });
      
      setCurrentRoomName(roomName);
      setRoomName("");
      setShowUpdateRoom(false);
      
      const updatedRoom = await getRoom(roomId);
      setRoomDetails(updatedRoom);
      
      onRoomUpdated?.(updatedRoom);
    } catch (error) {
      console.error("Update failed", error);
      onError?.(error as Error, "updateRoom");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (onBeforeDeleteRoom) {
        const shouldProceed = await onBeforeDeleteRoom(roomId);
        if (!shouldProceed) return;
      }

      setLoading(true);
      await deleteRoom(roomId);
      setShowDeleteConfirm(false);
      onRoomDeleted?.();
    } catch (error) {
      console.error("Delete failed", error);
      onError?.(error as Error, "deleteRoom");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatJoinedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role: string = 'member') => {
    switch (role) {
      case 'admin':
        return 'bg-purple-600 text-white';
      case 'member':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getMemberDisplayName = (member: RoomMember) => {
    return member.user?.username || member.user?.email?.split('@')[0] || "Unknown";
  };

  const getUserDisplayName = (user: User) => {
    return user.username || user.name || user.email?.split('@')[0] || "Unknown";
  };

  const Modal = ({ children, onClose, size = {} }: { children: ReactNode; onClose: () => void; size?: { width?: string; height?: string; maxWidth?: string; maxHeight?: string } }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-gray-900 rounded-lg p-6 relative flex flex-col ${size.width || "w-[500px]"} ${size.height || "h-auto"} ${size.maxWidth || "max-w-[90vw]"} ${size.maxHeight || "max-h-[90vh]"} ${modalClassName}`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl z-10"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );

  return (
    <>
      {/* Navbar */}
      <div className={`bg-gray-800 text-white p-3 flex items-center justify-between border-b border-gray-700 ${className}`}>
        <button
          onClick={() => enableRoomInfo && setShowRoomInfo(true)}
          className="text-lg font-semibold truncate flex-1 text-left hover:text-blue-400 transition-colors flex items-center gap-2"
        >
          {renderRoomIcon ? renderRoomIcon() : <DefaultRoomIcon />}
          {currentRoomName || "Loading..."}
        </button>
        
        <div className="flex gap-2 ml-4">
          {enableAddMembers && (
            <button
              onClick={() => setShowAddMembers(true)}
              className={`hover:bg-green-700 p-2 rounded transition-colors ${buttonClassName}`}
              title={labels.addMembers || "Add Members"}
            >
              {renderAddIcon ? renderAddIcon() : <DefaultAddIcon />}
            </button>
          )}
          
          {enableUpdateRoom && (
            <button
              onClick={() => setShowUpdateRoom(true)}
              className={`hover:bg-yellow-600 p-2 rounded transition-colors ${buttonClassName}`}
              title={labels.updateRoom || "Update Room"}
            >
              {renderEditIcon ? renderEditIcon() : <DefaultEditIcon />}
            </button>
          )}
          
          {enableDeleteRoom && (
            <button
              onClick={handleDeleteClick}
              className={`hover:bg-red-700 p-2 rounded transition-colors ${buttonClassName}`}
              title={labels.deleteRoom || "Delete Room"}
            >
              {renderDeleteIcon ? renderDeleteIcon() : <DefaultDeleteIcon />}
            </button>
          )}
        </div>
      </div>

      {/* Room Info Modal */}
      {showRoomInfo && roomDetails && (
        <Modal onClose={() => setShowRoomInfo(false)} size={roomInfoModalSize}>
          {/* Header Section - Fixed */}
          <div className="flex-shrink-0 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600 p-3 rounded-full flex-shrink-0">
                {renderRoomIcon ? renderRoomIcon() : <DefaultRoomIcon />}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold text-white truncate">{roomDetails.name}</h3>
                <p className="text-gray-400 text-sm">
                  {labels.created || "Created"} {formatDate(roomDetails.createdAt || new Date().toISOString())}
                </p>
              </div>
            </div>
          </div>
          
          {/* Members Section - Scrollable */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="flex-shrink-0 flex justify-between items-center mb-4">
              <h4 className="text-white font-semibold flex items-center gap-2">
                {renderInfoIcon ? renderInfoIcon() : <DefaultInfoIcon />}
                {labels.members || "Members"} ({roomMembers.length})
              </h4>
              <span className="text-xs text-gray-400">
                {roomDetails.isGroup ? (labels.groupChat || "Group Chat") : (labels.directMessage || "Direct Message")}
              </span>
            </div>
            
            {/* Scrollable Member List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {/* Header - hidden on mobile, visible on larger screens */}
              <div className="hidden md:grid md:grid-cols-12 gap-3 px-2 py-2 text-xs text-gray-400 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
                <div className="col-span-5">Member</div>
                <div className="col-span-3">Role</div>
                <div className="col-span-4">Joined Date</div>
              </div>
              
              {roomMembers.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No members in this room yet
                </div>
              ) : (
                roomMembers.map((member) => (
                  <div 
                    key={member.id} 
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {/* Member Info - Left side */}
                    <div className="flex items-center gap-3 md:col-span-5">
                      {renderMemberAvatar ? (
                        renderMemberAvatar(member)
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md flex-shrink-0">
                          {getMemberDisplayName(member).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-white truncate">
                          {getMemberDisplayName(member)}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {member.user?.email}
                        </div>
                      </div>
                    </div>
                    
                    {/* Role Badge - Middle */}
                    <div className="md:col-span-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)} whitespace-nowrap`}>
                        {member.role === 'admin' ? (labels.admin || 'Admin') : (labels.role || 'Member')}
                      </span>
                    </div>
                    
                    {/* Joined Date - Right */}
                    <div className="text-xs text-gray-400 md:col-span-4">
                      <span className="inline-flex items-center gap-1">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {labels.joined || "Joined"} {formatJoinedDate(member.joinedAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Add Members Modal with Fixed Size and Scrollable Dropdown */}
      {showAddMembers && (
        <Modal onClose={() => {
          setShowAddMembers(false);
          setSelectedUsers([]);
          setQuery("");
        }} size={addMembersModalSize}>
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-4 text-white pr-6 flex-shrink-0">
              {labels.addMembers || "Add Members"} to {currentRoomName}
            </h3>
            
            {/* Search Input with Dropdown */}
            <div className="relative mb-4 flex-shrink-0">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={labels.searchPlaceholder || "Search users by username or email..."}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              
              {/* Dropdown with fixed max height and scrollbar */}
              {showDropdown && (
                <div className="absolute w-full bg-gray-800 border border-gray-700 mt-1 rounded-lg shadow-lg z-20 overflow-hidden">
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {results.length === 0 ? (
                      <div className="p-3 text-gray-400 text-center">
                        {query.trim() ? (labels.noUsersFound || "No users found") : (labels.typeToSearch || "Type to search users")}
                      </div>
                    ) : (
                      results.map((user) => {
                        const isChecked = selectedUsers.some((u) => u.id === user.id);
                        const isAlreadyMember = roomMembers.some(member => {
                          const memberId = member.user?.id || member.id;
                          return Number(memberId) === Number(user.id);
                        });
                        
                        if (isAlreadyMember) return null;
                        
                        return (
                          <label
                            key={user.id}
                            className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleUser(user)}
                              className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white truncate">
                                {getUserDisplayName(user)}
                              </div>
                              {user.email && (
                                <div className="text-xs text-gray-400 truncate">
                                  {user.email}
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Current Members Section - Scrollable */}
            {roomMembers.length > 0 && (
              <div className="mb-4 flex-shrink-0">
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  {labels.currentMembers || "Current Members"} ({roomMembers.length})
                </h4>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1 custom-scrollbar">
                  {roomMembers.map((member) => (
                    <span
                      key={member.id}
                      className="bg-gray-700 px-2 py-1 rounded text-sm text-gray-200 inline-flex items-center gap-1"
                    >
                      {getMemberDisplayName(member)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Users to Add - Scrollable */}
            {selectedUsers.length > 0 && (
              <div className="mb-4 flex-shrink-0">
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  {labels.usersToAdd || "Users to Add"} ({selectedUsers.length})
                </h4>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 custom-scrollbar">
                  {selectedUsers.map((user) => (
                    <span
                      key={user.id}
                      className="bg-blue-600 px-2 py-1 rounded text-sm text-white flex items-center gap-1"
                    >
                      {getUserDisplayName(user)}
                      <button
                        onClick={() => toggleUser(user)}
                        className="hover:text-gray-200 ml-1 focus:outline-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Spacer to push buttons to bottom if content is short */}
            <div className="flex-1"></div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 flex-shrink-0">
              <button
                onClick={handleAddMembers}
                disabled={selectedUsers.length === 0 || loading}
                className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  `${labels.add || "Add"} ${selectedUsers.length} ${selectedUsers.length !== 1 ? (labels.members || "Members") : (labels.member || "Member")}`
                )}
              </button>
              <button
                onClick={() => {
                  setShowAddMembers(false);
                  setSelectedUsers([]);
                  setQuery("");
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded text-white transition-colors font-medium"
              >
                {labels.cancel || "Cancel"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Update Room Modal */}
      {showUpdateRoom && (
        <Modal onClose={() => {
          setShowUpdateRoom(false);
          setRoomName("");
        }} size={{ width: "w-96", height: "auto" }}>
          <h3 className="text-lg font-semibold mb-4 text-white pr-6">
            {labels.updateRoomName || "Update Room Name"}
          </h3>
          
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder={labels.enterRoomName || "Enter new room name"}
            className="w-full p-2 mb-4 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-500"
            autoFocus
          />

          <div className="flex gap-2">
            <button
              onClick={handleUpdateRoom}
              disabled={!roomName.trim() || loading}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 py-2 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "Updating..." : (labels.update || "Update Room")}
            </button>
            <button
              onClick={() => {
                setShowUpdateRoom(false);
                setRoomName("");
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded text-white transition-colors font-medium"
            >
              {labels.cancel || "Cancel"}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Room Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal onClose={handleCancelDelete} size={{ width: "w-96", height: "auto" }}>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              {renderWarningIcon ? renderWarningIcon() : <DefaultWarningIcon />}
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-2">
              {labels.deleteRoom || "Delete Room"}
            </h3>
            <p className="text-gray-300 mb-4">
              {labels.confirmDelete || "Are you sure you want to delete"} "<span className="font-semibold text-white">{currentRoomName}</span>"?
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {labels.deleteWarning || "This action cannot be undone. All messages and data in this room will be permanently deleted."}
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? "Deleting..." : (labels.delete || "Yes, Delete Room")}
              </button>
              <button
                onClick={handleCancelDelete}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded text-white transition-colors font-medium"
              >
                {labels.cancel || "Cancel"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </>
  );
};

export default RoomActionsNav;