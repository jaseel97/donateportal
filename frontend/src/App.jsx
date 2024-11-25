import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SamaritanHome from "./SamaritanHome";
import OrganizationHome from "./OrganizationHome";

function App() {
    return (
            <div>
                <Router>
                    <Routes>
                        <Route path="/doner" element={<SamaritanHome />} />
                        <Route path="/org" element={<OrganizationHome />} />
                    </Routes>
                </Router>
            </div>
    );
}
export default App;