"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { Check, CheckCheck, Loader2, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  buildChatWebSocketUrl,
  getChatMessages,
  getChats,
  markChatRead,
  sendChatMessage,
  type ChatMessage,
  type ChatRoom,
} from "@/lib/api/chats";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { resolveAssetUrl } from "@/lib/assets";

const roomSkeletonItems = [0, 1, 2, 3, 4, 5];

export function ChatDrawer({
  open,
  onOpenChange,
  initialChatId,
  onUnreadCountChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialChatId?: string | null;
  onUnreadCountChange?: (count: number) => void;
}) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isRoomsLoading, setIsRoomsLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const selectedChatIdRef = useRef<string | null>(null);
  const openRef = useRef(open);
  const draftInputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pendingReadChatIdsRef = useRef<Set<string>>(new Set());

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.chatId === selectedChatId) ?? null,
    [rooms, selectedChatId],
  );
  const selectedRoomMeta = useMemo(
    () => (selectedRoom ? getRoomMeta(selectedRoom, user?.id) : null),
    [selectedRoom, user?.id],
  );
  const selectedRoomProfileHref = useMemo(
    () => (selectedRoom ? getRoomProfileHref(selectedRoom, user?.id) : null),
    [selectedRoom, user?.id],
  );
  const messageGroups = useMemo(() => groupMessagesByDay(messages), [messages]);

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const count = getUnreadChatCount(rooms);
    onUnreadCountChange?.(count);
    window.dispatchEvent(
      new CustomEvent("intern-hub:chat-unread-count", { detail: { count } }),
    );
  }, [onUnreadCountChange, rooms]);

  useEffect(() => {
    resizeDraftInput(draftInputRef.current);
  }, [draft]);

  useEffect(() => {
    if (!open || !selectedChatId || isMessagesLoading) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [isMessagesLoading, messages.length, open, selectedChatId]);

  useEffect(() => {
    if (!user) {
      setRooms([]);
      setSelectedChatId(null);
      return;
    }

    let active = true;

    async function loadRooms() {
      try {
        setIsRoomsLoading(true);
        const loadedRooms = await getChats();
        if (!active) return;

        setRooms(loadedRooms);
        const nextChatId =
          open &&
          initialChatId &&
          loadedRooms.some((room) => room.chatId === initialChatId)
            ? initialChatId
            : selectedChatIdRef.current &&
                loadedRooms.some(
                  (room) => room.chatId === selectedChatIdRef.current,
                )
              ? selectedChatIdRef.current
              : null;
        setSelectedChatId(nextChatId);
      } catch (error) {
        console.error("Failed to load chats:", error);
        if (active) {
          toast.error("Не удалось загрузить чаты.");
        }
      } finally {
        if (active) {
          setIsRoomsLoading(false);
        }
      }
    }

    loadRooms();

    return () => {
      active = false;
    };
  }, [initialChatId, open, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      socketRef.current?.close();
      socketRef.current = null;
      return;
    }

    const currentUserId = String(user.id);
    const socket = new WebSocket(buildChatWebSocketUrl());
    socketRef.current = socket;

    socket.onopen = () => {
      const activeChatId = openRef.current ? selectedChatIdRef.current : null;
      const chatIds = new Set(pendingReadChatIdsRef.current);

      if (activeChatId) {
        chatIds.add(activeChatId);
      }

      pendingReadChatIdsRef.current.clear();
      chatIds.forEach((chatId) => sendReadReceipt(socket, chatId));
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as ChatSocketPayload;

        if ("type" in payload && payload.type === "READ_RECEIPT") {
          setMessages((current) =>
            markMessagesRead(current, payload.messageIds ?? []),
          );
          if (payload.readerId === currentUserId) {
            setRooms((current) =>
              setRoomUnreadCount(current, payload.chatId, 0),
            );
          }
          return;
        }

        const message = payload as ChatMessage;
        const activeChatId = openRef.current ? selectedChatIdRef.current : null;
        let roomExists = true;
        setRooms((current) => {
          roomExists = current.some((room) => room.chatId === message.chatId);

          return updateRoomPreview(
            current,
            message,
            currentUserId,
            activeChatId,
          );
        });

        if (!roomExists) {
          void getChats()
            .then(setRooms)
            .catch((error) => {
              console.warn("Failed to refresh chats:", error);
            });
        }

        if (message.chatId === activeChatId) {
          setMessages((current) => appendMessage(current, message));
          if (message.recipientId === currentUserId) {
            markSelectedChatRead(message.chatId);
          }
        }
      } catch (error) {
        console.error("Failed to parse chat message:", error);
      }
    };

    socket.onerror = () => {
      const pendingChatIds = Array.from(pendingReadChatIdsRef.current);
      pendingReadChatIdsRef.current.clear();
      pendingChatIds.forEach((chatId) => {
        void markChatRead(chatId).catch((error) => {
          console.warn("Failed to mark chat as read:", error);
        });
      });
      console.warn("Chat WebSocket connection failed");
    };

    return () => {
      socket.close();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [user?.id]);

  useEffect(() => {
    if (!open || !selectedChatId) {
      setMessages([]);
      return;
    }

    let active = true;
    const chatId = selectedChatId;

    async function loadMessages() {
      try {
        setIsMessagesLoading(true);
        const loadedMessages = await getChatMessages(chatId);
        if (active) {
          setMessages(loadedMessages);
          setRooms((current) => setRoomUnreadCount(current, chatId, 0));
          markSelectedChatRead(chatId);
        }
      } catch (error) {
        console.error("Failed to load chat messages:", error);
        if (active) {
          toast.error("Не удалось загрузить сообщения.");
        }
      } finally {
        if (active) {
          setIsMessagesLoading(false);
        }
      }
    }

    loadMessages();

    return () => {
      active = false;
    };
  }, [open, selectedChatId]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();

    if (!selectedChatId || !content) {
      return;
    }

    const socket = socketRef.current;
    setDraft("");

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ chatId: selectedChatId, content }));
      return;
    }

    try {
      setIsSending(true);
      const message = await sendChatMessage(selectedChatId, { content });
      setMessages((current) => appendMessage(current, message));
      setRooms((current) => updateRoomPreview(current, message));
    } catch (error) {
      console.error("Failed to send message:", error);
      setDraft(content);
      toast.error("Не удалось отправить сообщение.");
    } finally {
      setIsSending(false);
    }
  }

  function markSelectedChatRead(chatId: string) {
    if (!chatId) {
      return;
    }

    const socket = socketRef.current;
    setRooms((current) => setRoomUnreadCount(current, chatId, 0));

    if (socket?.readyState === WebSocket.OPEN) {
      sendReadReceipt(socket, chatId);
      return;
    }

    if (socket?.readyState === WebSocket.CONNECTING) {
      pendingReadChatIdsRef.current.add(chatId);
      return;
    }

    void markChatRead(chatId)
      .then((readMessages) => {
        setMessages((current) =>
          markMessagesRead(
            current,
            readMessages.map((message) => message.id),
          ),
        );
      })
      .catch((error) => {
        console.warn("Failed to mark chat as read:", error);
      });
  }

  function handleDraftKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="!w-full gap-0 p-0 sm:!max-w-4xl xl:!max-w-5xl"
      >
        <SheetHeader className="border-b p-5 pr-12">
          <SheetTitle className="flex items-center gap-2 text-xl font-extrabold">
            <MessageCircle className="text-[#0b63f6]" />
            Чаты
          </SheetTitle>
          <span className="hidden">
            Общение по приглашениям и принятым откликам.
          </span>
        </SheetHeader>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[18rem_minmax(0,1fr)] lg:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="min-h-0 border-b md:border-b-0 md:border-r">
            <div className="max-h-60 space-y-1 overflow-y-auto p-3 md:max-h-none">
              {isRoomsLoading ? (
                <ChatRoomListSkeleton />
              ) : rooms.length ? (
                rooms.map((room) => {
                  const isEmployerView = user?.id === room.employerId;
                  const meta = {
                    ...getRoomMeta(room, user?.id),
                    title: isEmployerView
                      ? room.candidateName || "Соискатель"
                      : getRoomListTitle(room, isEmployerView),
                    subtitle: getRoomListSubtitle(room, isEmployerView),
                  };
                  return (
                    <button
                      key={room.chatId}
                      type="button"
                      className={cn(
                        "relative flex w-full items-center gap-3 rounded-xl p-3 pr-10 text-left transition cursor-pointer hover:bg-[#f4f1e9]",
                        selectedChatId === room.chatId && "bg-[#edf3ff]",
                      )}
                      onClick={() => setSelectedChatId(room.chatId)}
                    >
                      <Avatar className="size-12">
                        <AvatarImage src={resolveAssetUrl(meta.avatarUrl)} />
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-[#171717]">
                          {meta.title}
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-[#171717]">
                          {meta.subtitle}
                        </span>
                        <span className="hidden">
                          {room.vacancyTitle || room.resumeProfession || "Чат"}
                        </span>
                        {room.lastMessage ? (
                          <span className="mt-1 block truncate text-xs text-[#777]">
                            {room.lastMessage}
                          </span>
                        ) : null}
                      </span>
                      {(room.unreadCount ?? 0) > 0 ? (
                        <span className="absolute right-3 top-3 flex min-w-5 items-center justify-center rounded-full bg-[#0b63f6] px-1.5 py-0.5 text-[11px] font-bold text-white">
                          {formatUnreadBadge(room.unreadCount)}
                        </span>
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <p className="rounded-xl border border-dashed p-4 text-sm text-[#626262]">
                  Пока нет активных чатов.
                </p>
              )}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col">
            {selectedRoom ? (
              <>
                <div className="border-b p-4">
                  <div className="flex items-start justify-between gap-3 pr-8">
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <Avatar className="size-11">
                          <AvatarImage
                            src={resolveAssetUrl(selectedRoomMeta?.avatarUrl)}
                          />
                        </Avatar>
                        <div>
                          {selectedRoomProfileHref ? (
                            <Link
                              href={selectedRoomProfileHref}
                              className="block truncate font-bold text-[#171717] hover:text-[#0b63f6]"
                            >
                              {selectedRoomMeta?.title}
                            </Link>
                          ) : (
                            <h3 className="truncate font-bold text-[#171717]">
                              {selectedRoomMeta?.title}
                            </h3>
                          )}
                          {selectedRoom.vacancyPublicId ? (
                            <Link
                              href={`/vacancies/${selectedRoom.vacancyPublicId}`}
                              className="mt-1 block truncate text-sm font-semibold text-[#0b63f6] hover:underline"
                            >
                              {selectedRoom.vacancyTitle || "Открыть вакансию"}
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#f7f7f4] px-4">
                  {isMessagesLoading ? (
                    <ChatMessagesSpinner />
                  ) : messageGroups.length ? (
                    messageGroups.map((group) => (
                      <div key={group.key} className="space-y-3">
                        <div className="flex justify-center py-1">
                          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#626262] shadow-sm">
                            {formatDateSeparator(group.date)}
                          </span>
                        </div>

                        {group.messages.map((message) => {
                          const own = message.senderId === String(user?.id);

                          return (
                            <div
                              key={message.id}
                              className={cn(
                                "flex",
                                own ? "justify-end" : "justify-start",
                              )}
                            >
                              <div
                                className={cn(
                                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                                  own
                                    ? "bg-[#0b63f6] text-white"
                                    : "border bg-white text-[#171717]",
                                )}
                              >
                                <p className="whitespace-pre-wrap break-words">
                                  {message.content}
                                </p>
                                <div
                                  className={cn(
                                    "mt-1 flex items-center justify-end gap-1 text-[11px]",
                                    own ? "text-white/75" : "text-[#777]",
                                  )}
                                >
                                  <span>
                                    {formatMessageTime(message.timestamp)}
                                  </span>
                                  {own ? (
                                    <MessageReadState status={message.status} />
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  ) : (
                    <p className="rounded-xl border border-dashed bg-white p-4 text-sm text-[#626262]">
                      Сообщений пока нет. Начните обсуждение собеседования.
                    </p>
                  )}
                  <div ref={messagesEndRef} aria-hidden="true" />
                </div>

                <form
                  onSubmit={submitMessage}
                  className="border-t bg-white p-4"
                >
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={draftInputRef}
                      value={draft}
                      onChange={(event) => {
                        setDraft(event.target.value);
                        resizeDraftInput(event.currentTarget);
                      }}
                      onKeyDown={handleDraftKeyDown}
                      placeholder="Напишите сообщение"
                      className="min-h-11 flex-1 resize-none rounded-xl border bg-white px-3 py-3 text-sm leading-5 outline-none focus:border-[#0b63f6]"
                      rows={1}
                    />
                    <Button
                      type="submit"
                      className="h-11 w-11 rounded-xl bg-[#0b63f6] text-white"
                      disabled={!draft.trim() || isSending}
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </form>
              </>
            ) : isRoomsLoading ? (
              <ChatConversationSkeleton />
            ) : (
              <div className="flex flex-1 bg-[#f7f7f4]" aria-hidden="true" />
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ChatRoomListSkeleton() {
  return (
    <div className="space-y-1" role="status" aria-label="Загрузка чатов">
      {roomSkeletonItems.map((item) => (
        <div
          key={item}
          className="flex w-full items-center gap-3 rounded-xl p-3"
        >
          <Skeleton className="size-12 shrink-0 rounded-full bg-[#e8e5dc]" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded-full bg-[#e8e5dc]" />
            <Skeleton className="h-3 w-2/3 rounded-full bg-[#e8e5dc]" />
            <Skeleton className="h-3 w-5/6 rounded-full bg-[#e8e5dc]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatConversationSkeleton() {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col bg-[#f7f7f4]"
      role="status"
      aria-label="Загрузка чата"
    >
      <div className="border-b bg-white p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-full bg-[#e8e5dc]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-44 rounded-full bg-[#e8e5dc]" />
            <Skeleton className="h-3 w-56 rounded-full bg-[#e8e5dc]" />
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-4">
        <ChatMessagesSpinner />
      </div>
      <div className="border-t bg-white p-4">
        <Skeleton className="h-11 rounded-xl bg-[#e8e5dc]" />
      </div>
    </div>
  );
}

function ChatMessagesSpinner() {
  return (
    <div
      className="flex h-full min-h-full items-center justify-center"
      role="status"
      aria-label="Загрузка сообщений"
    >
      <Loader2 className="h-6 w-6 animate-spin text-[#0b63f6]" />
    </div>
  );
}

type ChatSocketPayload =
  | ChatMessage
  | {
      type: "READ_RECEIPT";
      chatId: string;
      readerId: string;
      messageIds: string[];
    };

interface MessageGroup {
  key: string;
  date: Date;
  messages: ChatMessage[];
}

function MessageReadState({ status }: { status?: string }) {
  const isRead = status === "READ";
  const label = isRead ? "Прочитано" : "Не прочитано";

  return isRead ? (
    <CheckCheck aria-label={label} className="h-3.5 w-3.5 text-white" />
  ) : (
    <Check aria-label={label} className="h-3.5 w-3.5 text-white/75" />
  );
}

function sendReadReceipt(socket: WebSocket, chatId: string) {
  socket.send(JSON.stringify({ type: "READ", chatId }));
}

// function Avatar({ src, label }: { src?: string; label: string }) {
//   const avatarUrl = resolveAssetUrl(src);

//   return (
//     <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#edf3ff] text-[#0b63f6]">
//       {avatarUrl ? (
//         <img
//           src={avatarUrl}
//           alt={label}
//           className="h-full w-full object-cover"
//         />
//       ) : (
//         <UserRound className="h-5 w-5" />
//       )}
//     </span>
//   );
// }

function resizeDraftInput(textarea: HTMLTextAreaElement | null) {
  if (!textarea) {
    return;
  }

  textarea.style.height = "auto";

  const view = textarea.ownerDocument.defaultView;
  const computed = view?.getComputedStyle(textarea);
  const lineHeight = parseCssPixels(computed?.lineHeight, 20);
  const paddingTop = parseCssPixels(computed?.paddingTop, 0);
  const paddingBottom = parseCssPixels(computed?.paddingBottom, 0);
  const borderTop = parseCssPixels(computed?.borderTopWidth, 0);
  const borderBottom = parseCssPixels(computed?.borderBottomWidth, 0);
  const maxHeight =
    lineHeight * 5 + paddingTop + paddingBottom + borderTop + borderBottom;
  const nextHeight = Math.min(textarea.scrollHeight, maxHeight);

  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY =
    textarea.scrollHeight > maxHeight ? "auto" : "hidden";
}

function parseCssPixels(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function getRoomListTitle(room: ChatRoom, isEmployerView: boolean) {
  if (!isEmployerView) {
    return room.employerName || "Работодатель";
  }

  return room.candidateName || "Соискатель";
}

function getRoomListSubtitle(room: ChatRoom, isEmployerView: boolean) {
  if (isEmployerView) {
    return room.resumeProfession || "Резюме";
  }

  return room.vacancyTitle || "Вакансия";
}

function getRoomMeta(room: ChatRoom, currentUserId?: number) {
  const isEmployer = currentUserId === room.employerId;

  return {
    title: isEmployer
      ? room.candidateName || "Соискатель"
      : room.employerName || "Работодатель",
    avatarUrl: isEmployer ? room.candidateAvatarUrl : room.employerAvatarUrl,
  };
}

function getRoomProfileHref(room: ChatRoom, currentUserId?: number) {
  if (currentUserId === room.employerId) {
    return room.candidateId ? `/candidate/${room.candidateId}` : null;
  }

  return room.employerId ? `/employers/${room.employerId}` : null;
}

function appendMessage(messages: ChatMessage[], message: ChatMessage) {
  if (messages.some((item) => item.id === message.id)) {
    return messages.map((item) =>
      item.id === message.id ? { ...item, ...message } : item,
    );
  }

  return [...messages, message];
}

function markMessagesRead(messages: ChatMessage[], messageIds: string[]) {
  if (!messageIds.length) {
    return messages;
  }

  const readIds = new Set(messageIds);

  return messages.map((message) =>
    readIds.has(message.id) ? { ...message, status: "READ" } : message,
  );
}

function setRoomUnreadCount(
  rooms: ChatRoom[],
  chatId: string,
  unreadCount: number,
) {
  return rooms.map((room) =>
    room.chatId === chatId ? { ...room, unreadCount } : room,
  );
}

function updateRoomPreview(
  rooms: ChatRoom[],
  message: ChatMessage,
  currentUserId?: string,
  activeChatId?: string | null,
) {
  return rooms
    .map((room) => {
      if (room.chatId !== message.chatId) {
        return room;
      }

      const isUnreadIncoming =
        message.recipientId === currentUserId &&
        message.chatId !== activeChatId;

      return {
        ...room,
        lastMessage: message.content,
        lastMessageAt: message.timestamp,
        unreadCount: isUnreadIncoming
          ? (room.unreadCount ?? 0) + 1
          : message.chatId === activeChatId
            ? 0
            : room.unreadCount,
        updatedAt: message.timestamp,
      };
    })
    .sort((left, right) =>
      String(right.updatedAt ?? "").localeCompare(String(left.updatedAt ?? "")),
    );
}

function groupMessagesByDay(messages: ChatMessage[]): MessageGroup[] {
  const groups = new Map<string, MessageGroup>();

  messages.forEach((message) => {
    const date = new Date(message.timestamp);
    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    const group =
      groups.get(key) ??
      ({
        key,
        date,
        messages: [],
      } satisfies MessageGroup);

    group.messages.push(message);
    groups.set(key, group);
  });

  return Array.from(groups.values());
}

function formatDateSeparator(value: Date) {
  const today = startOfDay(new Date());
  const target = startOfDay(value);
  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (diffDays === 0) {
    return "Сегодня";
  }

  if (diffDays === 1) {
    return "Вчера";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: today.getFullYear() === target.getFullYear() ? undefined : "numeric",
  }).format(value);
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function formatMessageTime(value?: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getUnreadChatCount(rooms: ChatRoom[]) {
  return rooms.filter((room) => (room.unreadCount ?? 0) > 0).length;
}

function formatUnreadBadge(value?: number) {
  if (!value) {
    return "";
  }

  return value > 99 ? "99+" : String(value);
}
