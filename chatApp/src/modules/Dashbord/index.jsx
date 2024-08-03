import { useEffect, useState, useRef } from "react";
import Avatar from "../../assets/user.svg";
import Input from "../../components/Input";
import { io } from "socket.io-client";
function Dashbord() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("userDetails"))
  );
  const [conversations, setConversations] = useState([]);
  const [messages, setMessage] = useState({});
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");
  const [msgLength, setMsgLength] = useState([]);
  const [socket, setSocket] = useState(null);
  const [socketUsers, setsoketUsers] = useState([]);
  const messageRef = useRef(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [searchInput ,setSearchInput]=useState("");
  let img = Avatar;

  const url = "https://chat-application-ga4s.onrender.com"
  // const url ="http://localhost:5000"; 

  useEffect(() => {
    setSocket(io(url));
  }, []);

  useEffect(() => {
    socket?.emit("addUser", user);
    // console.log(user.userId)
    socket?.on("getUser", (users) => {
      // console.log('activeUsers :',users)
      setActiveUsers(users);
      // console.log(users)
    });

    socket?.on("getMessage", (data) => {
      // console.log(data)
      // console.log(messages)
      setMessage((prev) => ({
        ...prev,
        messages: [...prev.messages, { ...data }], // user, message: data.message
      }));
      // console.log({hii:messages})

      // setMessage({messages:,receiver:user,conversationId})
    });
  }, [socket]);

  useEffect(() => {
    const logInUser = JSON.parse(localStorage.getItem("userDetails"));
    const fetchConversations = async () => {
      const result = await fetch(
        `${url}/msg/conversation/${logInUser.userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const response = await result.json();
      // console.log(response)
      setConversations(response);
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    messageRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.messages]);

  useEffect(() => {
    const fetchUsers = async () => {
      const result = await fetch(`${url}/user/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await result.json();
      // console.log(response)
      setUsers(response);
      // console.log(response)
    };
    fetchUsers();
  }, []);

  useEffect(()=>{
    const findUser=async(value)=>{
      
      // console.log(e.target.value)
      const result  = await fetch(`${url}/user/searchUser/${value}`,{
        method:'GET',
        headers :{
          "Content-Type": "application/json",
        }
      })
  
      const response = await result.json()
  
      if(response.status){
        setUsers(response.data);
        // console.log(users)
      }
      else{
        setUsers([])
      }
      
      // console.log(users)
  
  
    }
    const fetchUsers = async () => {
      const result = await fetch(`${url}/user/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await result.json();
      // console.log(response)
      setUsers(response);
      // console.log(response)
    };
    if(searchInput){
      findUser(searchInput)
    }
    else{
      fetchUsers()
    }
    
  },[searchInput])

 const searchUser=(e)=>{
  e.preventDefault();
  setSearchInput(e.target.value)
 }
  const sendMessage = async (e) => {
    e.preventDefault();
    setMsg("");
    socket?.emit("sendMessage", {
      senderId: user.userId,
      message: msg,
      receiverId: messages?.receiver?.id,
      conversationId: messages?.conversationId,
    });

    const result = await fetch(`${url}/msg/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId: messages?.conversationId,
        senderId: user?.userId,
        message: msg,
        receiverId: messages?.receiver?.id,
      }),
    });
    const response = await result.json();

    // console.log(response.msg)
    // console.log(conversations)
    // console.log(messages)
  };

  const fetchMessages = async (conversationId, user) => {
    const result = await fetch(`${url}/msg/message/${conversationId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response = await result.json();
    // console.log(response)
    // setConversations(response);

    setMessage({ messages: response, receiver: user, conversationId });
    //  console.log(messages)

    //  setMsgLength(response.length)
    //  console.log(response.length)
    // return response.length
  };

  // const findMsgsLength=async (conversationId)=>{
  //   const result  = await fetch(`http://localhost:5000/msg/message/${conversationId}`,{
  //     method:'GET',
  //     headers:{
  //       'Content-Type':'application/json',
  //     },
  //   });
  //   const response  = await result.json();

  //   setMsgLength(response.length)

  // }

  const startConversation = async (receiverId, receiver) => {
    const result = await fetch(`${url}/msg/conversationCheck/${user.userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiverId,
      }),
    });
    const response = await result.json();
    // console.log(response)
    // setConversations(response);
    // setMessage({messages:response,receiver:user,conversationId})
    if (response.isnew) {
      setMessage({
        messages: [],
        receiver: { ...receiver, id: receiverId },
        conversationId: response.conversationId,
      });
    } else {
      // setMessage({messages:null,receiver:{...receiver,id:receiverId},conversationId:response.conversationId})
      fetchMessages(response.conversationId, { ...receiver, id: receiverId });
    }

    // console.log(messages)
  };

  return (
    <div className="w-screen flex">
      <div className="w-[25%]  h-screen bg-light">
        <div className="flex justify-center items-center my-8">
          <div className="border border-light rounded-full p-1">
            <img src={Avatar} width={50} height={75} className="w-15 h-15 object-cover rounded-full" />
          </div>

          <div className="ml-4">
            <h3 className="text-2xl">{user.name}</h3>
            <p className="text-lg font-light">My Account</p>
          </div>
        </div>
        <hr></hr>
        <div className="mx-10 mt-5 h-[calc(100vh-200px)] ">
          <div className="text-primary text-xl">Messages</div>
          <div className="h-[100%] overflow-scroll no-scrollbar border-b w-full">
            {conversations.length > 0 ? (
              conversations.map(({ conversationId, user }, index) => {
                // console.log(user)
                const isOnline = activeUsers.find(
                  (item) => item.userId === user.id
                );

                // console.log(conversation)
                // if(conversation){
                // const {fullname ,email} = conversation.user}
                // findMsgsLength(conversationId)
                //  if( msgLength>0){

                return (
                  <div
                    className="flex items-center py-4 border-b border-b-gray-300"
                    key={index}
                  >
                    <div
                      className="flex cursor-pointer w-[100%]"
                      onClick={() => fetchMessages(conversationId, user)}
                    >
                      <div className="border border-secondary  rounded-full p-0.5 w-[20%]">
                        <img src={img} width={40} height={65}  className="w-[100%] h-[100%] object-cover rounded-full"/>
                      </div>
                      <div className="ml-6 w-[80%] overflow-hidden">
                        <h3 className="text-xl  truncate">{user?.fullname}</h3>
                        {isOnline ? (
            <p className="text-md font-light flex items-center">
    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 inline-block"></span>
    <span className="text-gray-800">Online</span>
  </p>
) : (
  <p className="text-md font-light flex items-center">
    <span className="w-2 h-2 rounded-full bg-gray-400 mr-2 inline-block"></span>
    <span className="text-gray-800">Offline</span>
  </p>
)}
                      </div>
                    </div>
                  </div>
                );
                // }
              })
            ) : (
              <div className="text-center text-lg font-semibold my-24">
                No Conversations
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-[50%]  h-screen bg-white flex flex-col items-center">
        {messages?.receiver?.fullname ? (
          <>
            <div className="w-[75%] bg-light shadow-md h-[52px] mt-8 mb-5 rounded-full flex items-center px-10 py-3">
              <div className="rounded-full border border-black">
                <img src={Avatar} width={40} height={65} />
              </div>
              <div className="flex flex-col ml-4  mr-auto items-start">
                <h3 className="text-lg mb-0  ">
                  {" "}
                  {messages.receiver.fullname}
                </h3>
                {activeUsers.find(
                  (item) => item.userId === messages.receiver.id
                ) ? (
                  <p className="text-md font-light flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2 inline-block"></span>
                  <span className="text-gray-800">Online</span>
                </p>
                ) : (
                  //  console.log("active users : " ,activeUsers)
                  <p className="text-md font-light flex items-center">
                  <span className="w-2 h-2 rounded-full bg-gray-400 mr-2 inline-block"></span>
                  <span className="text-gray-800">Offline</span>
                </p>
                )}
              </div>
              <div className="flex items-end">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-tabler icons-tabler-outline icon-tabler-phone-outgoing cursor-pointer"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
                  <path d="M15 9l5 -5" />
                  <path d="M16 4l4 0l0 4" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-tabler icons-tabler-outline icon-tabler-video-plus ml-4 cursor-pointer"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z" />
                  <path d="M3 6m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" />
                  <path d="M7 12l4 0" />
                  <path d="M9 10l0 4" />
                </svg>
              </div>
            </div>

            <div className="h-[100%] overflow-scroll no-scrollbar border-b w-full">
              <div className=" px-10 py-14">
                {/* <div className=" max-w-[45%] bg-light text-s rounded-b-xl p-2 rounded-tr-xl">
              Five security officials including an Army jawan were critically
              injured
            </div>
            <div className=" max-w-[45%] text-white p-2 bg-primary rounded-b-xl rounded-tl-xl ml-auto mt-5">
              Five security officials
            </div> */}
                <div>
                  {messages?.messages?.length > 0 ? (
                    messages.messages.map(
                      ({ message, user: { id } }, index) => {
                        // console.log({id,userID:user.userID})
                        return (
                          <>
                            <div
                              className={`max-w-[45%]  rounded-b-xl  p-2  mt-1 ${
                                id === user.userId
                                  ? "bg-primary text-white rounded-tl-xl ml-auto "
                                  : "bg-light text-black rounded-tr-xl"
                              }`}
                              key={index}
                            >
                              {message}
                            </div>
                            <div ref={messageRef}></div>
                          </>
                        );

                        //     if(user.userId !== id){
                        //     return(
                        //       <div
                        //       className="max-w-[45%] bg-light text-s rounded-b-xl p-2 rounded-tr-xl mt-1"
                        //       key={index}
                        //     >
                        //       {message}
                        //     </div>
                        //     )}
                        //     else{
                        //       return(
                        //         <div
                        //   className="max-w-[45%] text-white p-2 bg-primary rounded-b-xl rounded-tl-xl ml-auto mt-1"
                        //   key={index}
                        // >
                        //   {message}
                        // </div>
                        //       )
                        //     }
                      }
                    )
                  ) : (
                    <div className="text-center text-lg mt-[50]">
                      No Messages
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-3 w-full justify-center mt-3 flex items-center">
              <form
                className="w-[75%] "
                onSubmit={(e) => {
                  e.preventDefault();
                  if (msg) {
                    sendMessage(e);
                  }
                }}
              >
                <Input
                  placeholder="Type your message.."
                  className="w-[100%] "
                  name="message"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  inputClassName="p-3 border-0 placeholder-gray-700 px-10 shadow-md rounded-full p-5 bg-light text-primary focus:bg-light"
                ></Input>
              </form>

              <div
                className={`ml-4  cursor-pointer  p-1 ${
                  !msg && "pointer-events-none"
                }`}
                onClick={sendMessage}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-tabler icons-tabler-outline icon-tabler-send"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M10 14l11 -11" />
                  <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
                </svg>
              </div>
              <div className="ml-2  cursor-pointer  p-1 ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-tabler icons-tabler-outline icon-tabler-circle-plus"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                  <path d="M9 12h6" />
                  <path d="M12 9v6" />
                </svg>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-lg font-semibold mt-[50%] ">
            {" "}
            No Conversation{" "}
          </div>
        )}
      </div>

      <div className="w-[25%] h-screen border px-2 pb-8 pt-2 bg-light ">
        
          <div>
                <Input
                  placeholder="Search for user"
                  className="w-[100%]"
                  name="message"
                  value={searchInput}
                  onChange={searchUser}
                  inputClassName="p-2 w-[100%] border-primary placeholder-gray-800 px-10 shadow-md rounded-full p-5 bg-light text-primary "
                ></Input>

              </div>
              <div className="text-primary text-xl px-4 font-solid">
          People
          </div>
        <div className="h-[90%] overflow-scroll no-scrollbar px-4 py-1 border-b w-full">
          {users.length > 0 ? (
            users.map(({ user, userId }, index) => {
              // console.log(conversation)
              // if(conversation){
              // const {fullname ,email} = conversation.user}
              return (
                <div
                  className="flex items-center py-4 border-b border-b-gray-300"
                  key={index}
                >
                  <div
                    className="flex cursor-pointer w-[80%]"
                    onClick={() => startConversation(userId, user)}
                  >
                    <div className="border border-secondary rounded-full p-0.5 w-[20%]">
                      <img
                        src={img}
                        alt="User"
                        className="w-10 h-10 object-cover rounded-full"
                      />
                    </div>
                    <div className="ml-6 w-[80%] overflow-hidden">
                      <h3 className="text-xl truncate">{user?.fullname}</h3>
                      <p className="text-sm font-light text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div> 
              );
            })
          ) : (
            <div className="text-center text-lg font-semibold my-24">
              No Users Found !
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default Dashbord;
