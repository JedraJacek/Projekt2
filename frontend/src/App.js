import React, {useEffect, useState} from 'react';
import axios from "axios";
import {API_URL} from "./constants";
import { ReactSession } from 'react-client-session';

function App() {

    ReactSession.setStoreType("localStorage");

    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState({note_text: "", username: ""});

    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({pk: "", username: "", password: ""});
    const [selectedUser, setSelectedUser] = useState({pk: "", username: "", password: ""});
    const [loginUser, setLoginUser] = useState({pk: "", login: "", password: ""});
    const [session, setSession] = useState({session: ""});

    const onLoginChange = e => {
        const {name, value} = e.target;
        setLoginUser((prevLogin) => ({
            ...prevLogin,
            [name]: value,
        }));
    };

    const onUserChange = e => {
        const {name, value} = e.target;
        setNewUser((prevUser) => ({
            ...prevUser,
            [name]: value,
        }));
    };

    const onNoteChange = e => {
        const {name, value} = e.target;
        setNewNote((prevNote) => ({
            ...prevNote,
            [name]: value
        }));
    }

    const loginNewUser = () => {
        if (loginUser.login.trim() !== '' && loginUser.password.trim() !== '') {
            axios.post(API_URL + "check-user", loginUser).then(function(response){
                ReactSession.set("Session", response.data['Session']);
                    alert(ReactSession.get('Session'));
                    window.location.reload();
                }).catch(function(error){
                    alert("Error");
                })
        }
    };

    const logout = () => {
        ReactSession.remove('Session');
        window.location.reload();
    }
    
    const onUserSelect = e => {
        const name = e;
        const user = users.find(user => user.username === name);
        setSelectedUser(user);
        onNoteChange({target: {name: "username", value: user.username}});
    }

    const addNote = () => {
        if (newNote.note_text.trim() !== '' && newNote.username.trim() == ReactSession.get("Session")) {
            console.log("text: " + newNote.note_text + ", username: " + newNote.username + ", owner: " + selectedUser.pk);
            axios.post(API_URL + "create-note", {"note_text": newNote.note_text, "owner": selectedUser.pk});
            setNotes([...notes, newNote]);
            setNewNote({note_text: "", username: newNote.username});
        }
    };

    const addUser = () => {
        if (newUser.username.trim() !== '' && newUser.password.trim() !== '') {
            axios.post(API_URL + "create-user", newUser);
            setUsers([...users, newUser]);
            setNewUser({username: "", password: ""});
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersResponse = await axios.get(API_URL + "users");
                const notesResponse = await axios.get(API_URL + "notes?Session=" + ReactSession.get("Session"));

                // Assuming both requests were successful
                const usersData = usersResponse.data;
                var notesData = notesResponse.data;
                
                if(!Array.isArray(notesData)){
                    notesData = [notesData]
                }

                const notesWithUsernames = notesData.map((note) => {
                    const user = usersData.find((user) => user.pk === note.owner);
                    return {...note, username: user.username};
                });


                setUsers(usersData);
                setNotes(notesWithUsernames);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    if(ReactSession.get('Session') != null){
        return (
            <div>
                <h1>Notes App</h1>
                <div>
                    <input
                        type="text"
                        placeholder="Add a new note"
                        name="note_text"
                        value={newNote.note_text}
                        onChange={(e) => onNoteChange(e)}
                    />
                    <select value={selectedUser.username} onChange={(e) => onUserSelect(e.target.value)}>
                        <option value="">Select User</option>
                        {users.map((user, index) => (
                            <option key={index} value={user.username}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                    <button onClick={addNote}>Add</button>
                </div>
    
    
                <h3>Notes</h3>
                <ul>
                    {notes.map((note, index) => (
                        <li key={index}>
                            <div>
                                <span>Username: </span>
                                {note.username}
                                <br/>
                                <span>Note: </span>
                                {note.note_text}
                            </div>
                        </li>
                    ))}
                </ul>
                <h3>Users</h3>
                <ul>
                    {users.map((user, index) => (
                        <li key={index}>
                            <div>
                                <span>Username: </span>
                                {user.username}
                            </div>
                        </li>
                    ))}
                </ul>

                <button onClick={logout}>Logout</button>
            </div>
        );
    } else {
        return (
            <div>
                <h3>Login</h3>
                <div>
                    <input
                        type="text"
                        placeholder="login"
                        name="login"
                        value={loginUser.login}
                        onChange={(e) => onLoginChange(e)}
                    />
                    <input
                        type="password"
                        placeholder="password"
                        name="password"
                        value={loginUser.password}
                        onChange={(e) => onLoginChange(e)}
                    />
                    <button onClick={loginNewUser}>Login</button><br/>
                </div>
                <h3>Create User</h3>
                <div>
                    <input
                        type="text"
                        placeholder="username"
                        name="username"
                        value={newUser.username}
                        onChange={(e) => onUserChange(e)}
                    />
                    <input
                        type="password"
                        placeholder="password"
                        name="password"
                        value={newUser.password}
                        onChange={(e) => onUserChange(e)}
                    />
                    <button onClick={addUser}>Add</button>
                </div>
            </div>
        );
    }

    
}

export default App;