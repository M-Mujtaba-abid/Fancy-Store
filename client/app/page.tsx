import Carosel from "@/components/shop/mainPage/navbarItems/Carosel"
import Navbar from "@/components/shop/mainPage/navbarItems/Navbar"


const page = () => {
  return (
    <div className="min-h-screen">
      <Navbar/>
      <Carosel/>
      {/* <h1 className="text-primary text-4xl font-bold">Fancy Store</h1>
      <p>Helo, welcome to the store.</p> */}
    </div>
  )
}

export default page
