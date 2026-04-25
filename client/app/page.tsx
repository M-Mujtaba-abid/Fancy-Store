import Carosel from "@/components/shop/mainPage/Carosel"
import Category from "@/components/shop/mainPage/categories/Category"
import NewArrivals from "@/components/shop/mainPage/categories/NewArivals"
import ProductGrid from "@/components/shop/mainPage/categories/ProductGrid"
import Sale from "@/components/shop/mainPage/categories/Sale"
// import Sale from "@/components/shop/mainPage/categories/Sale"



const page = () => {
  return (
    <div className="min-h-screen">
      {/* <Navbar/> */}
      <Carosel/>
      <Category/>
      <NewArrivals/>
      <Sale/>
      <ProductGrid/>
      {/* <Footer/> */}
      {/* <Sale/> */}
      {/* <h1 className="text-primary text-4xl font-bold">Fancy Store</h1>
      <p>Helo, welcome to the store.</p> */}
    </div>
  )
}

export default page
