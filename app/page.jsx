import { Navbar, Footer, KegiatanContainer} from "./components"

const page = () => {
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar/>
        <div className="my-40 flex-1">test</div>
        <KegiatanContainer/>

        <Footer/>
    </div>
  )
}

export default page