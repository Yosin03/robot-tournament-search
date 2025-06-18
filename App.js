import {Routes, Route} from "react-router-dom"
import React, {useState, useEffect} from "react";
// import "./css/App.css"
import Main from "./components/Main"
import Robot from "./components/Robot"
import Profile from "./components/UserProfile";
import Agreed from "./components/Agreed";
import Page404 from "./components/Page404";
import EditTour from "./components/EditTour";
import SearchResults from './components/SearchResults';
import Layout from "./layout";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/de';
import RegisterForTournament from "./components/registerfortournament";
import EditUser from "./components/UserEdit";
import EditRobot from "./components/EditRobot";
import Fight from "./components/Fight";
import api from "./api";
import Tournament from "./components/Tournament";
import UserConfirm from "./components/UserConfirm";
import Admin from "./components/Admin";
import TournamentAddPart from "./components/TournamentAddPart";
import ScreenTournament from "./components/ScreenTournament";
import FightEdit from "./components/FightEdit";
import Supertour from "./components/Supertour";

const App = () => {
    const [userId, setUserId] = useState(undefined)
    const [token, setToken] = useState("") // ✅ ИСПРАВЛЕНО: раскомментировал

    // Замените useEffect в App.js на это:
    useEffect(() => {
        (async ()=> {
        let sUserId;
        try{
            let info = localStorage.getItem("userId")
            console.log('👤 Checking saved user:', info)
            if (info) {
                sUserId = JSON.parse(info)
                
                // Проверяем логин ТОЛЬКО если есть user_id
                if (sUserId?.user_id) {
                    try {
                        await api.testlogin(sUserId.user_id)
                        console.log('✅ User login confirmed:', sUserId)
                        setUserId(sUserId !== "null" ? sUserId : undefined)
                    } catch (loginErr) {
                        console.log('❌ Login test failed, clearing user data:', loginErr)
                        localStorage.removeItem("userId")
                        setUserId(undefined)
                    }
                } else {
                    console.log('🔄 No user data found, continuing as guest')
                    setUserId(undefined)
                }
            } else {
                console.log('🆕 No saved user, starting as guest')
                setUserId(undefined)
            }
        } catch (err){
            console.error('💥 Error checking user:', err)
            setUserId(undefined)
        }
        })()
    }, []);

    // useEffect(() => {
    //     localStorage.setItem("userId", JSON.stringify(userId))
    //     console.log('TO localstorage',JSON.stringify(userId))
    //     // sessionStorage.setItem("token", token)
    // }, [userId]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
        <Routes>
            <Route 
                path="/screen/:id" 
                element={<ScreenTournament userId={userId} setUserId={setUserId} />} 
                action={({ params }) => {}} 
                loader={async ({ params }) => {return fetch(`/api/tournaments/${params.id}.json`);}} 
            />
            <Route path="*" element={
                <Layout userId={userId} setUserId={setUserId}>
                    <Routes>
                        {/* ✅ ИСПРАВЛЕНО: добавил закрывающую скобку */}
                        <Route 
                            path="/search" 
                            element={<SearchResults userId={userId} setUserId={setUserId} token={token} setToken={setToken} />} 
                        />
                        <Route path="/" element={<Main userId={userId} setUserId={setUserId} />}/>
                        <Route 
                            path="/tournaments/:id/edit" 
                            element={<EditTour userId={userId} setUserId={setUserId} />} 
                            action={({ params }) => {}} 
                            loader={async ({ params }) => {return fetch(`/api/tournaments/${params.id}.json`);}} 
                        />
                        <Route path="/tournaments/:id/reg" element={<RegisterForTournament userId={userId} setUserId={setUserId} />} />
                        <Route path="/tournaments/:id/add" element={<TournamentAddPart userId={userId} setUserId={setUserId} />} />
                        <Route path="/tournaments/:id/*" element={<Tournament userId={userId} setUserId={setUserId} />} action={({ params }) => {}}/>
                        <Route path="/supertour/:id/*" element={<Supertour userId={userId} setUserId={setUserId} />} action={({ params }) => {}}/>
                        <Route path="/user/:id/confirm" element={<UserConfirm userId={userId} setUserId={setUserId} />}/>
                        <Route path="/user/:id/edit" element={<EditUser userId={userId} setUserId={setUserId} />}/>
                        <Route path="/user/:id" element={<Profile userId={userId} setUserId={setUserId} />}/>
                        <Route path="/user/:id/robot/:rid/edit" element={<EditRobot userId={userId} setUserId={setUserId} />}/>
                        <Route path="/user/:id/robot/:rid" element={<Robot userId={userId} setUserId={setUserId} />}/>
                        {/* <Route path="/robot/:id/edit" element={<EditRobot userId={userId} setUserId={setUserId} />}/> */}
                        {/* <Route path="/robot/:id" element={<Robot userId={userId} setUserId={setUserId} />}/> */}
                        <Route path="/fight/:id" element={<Fight userId={userId} setUserId={setUserId} />}/>
                        <Route path="/fightedit/:id" element={<FightEdit userId={userId} setUserId={setUserId} />}/>
                        <Route path="/tournaments/:id/agreed" element={<Agreed userId={userId} setUserId={setUserId} />}/>
                        <Route path="/admin/*" element={<Admin userId={userId} setUserId={setUserId} />}/>
                        <Route path="*" element={<Page404 userId={userId} setUserId={setUserId} />}/>
                    </Routes>
                </Layout>
            } />
        </Routes>
        </LocalizationProvider>
    )
}

export default App