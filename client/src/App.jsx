import Sidebar from "./components/Sidebar";
import Main from "./components/Main";

function App() {
  return (
    <div className="grid grid-cols-4">
      <div className="col-span-1">
        <Sidebar />
      </div>
      <div className="col-span-3">
        <Main />
      </div>
    </div>
  );
}

export default App;
