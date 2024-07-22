import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Form from './modules/Form'
import Dashbord from './modules/Dashbord'

import { BrowserRouter as Router ,Route ,Routes} from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <div className= "bg-light h-screen flex justify-center items-center">
      {/* <Form></Form> */}
      {/* <Dashbord></Dashbord> */}

      <Router>
        <Routes>
          <Route path='/' element={<Form isSigninPage={true}></Form>}></Route>
          <Route path='/user/signUp' element={<Form isSigninPage={false}></Form>}></Route>
          <Route path='/user/dashbord' element={<Dashbord></Dashbord>}></Route>
        </Routes>

      </Router>
     </div>
    </>
  )
}

export default App
