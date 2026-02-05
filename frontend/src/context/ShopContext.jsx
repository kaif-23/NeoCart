import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authDataContext } from './AuthContext'
import axios from 'axios'
import { userDataContext } from './UserContext'
import { toast } from 'react-toastify'

 export const shopDataContext = createContext()
function ShopContext({children}) {

    let [products,setProducts] = useState([])
    let [search,setSearch] = useState('')
    let {userData} = useContext(userDataContext)
    let [showSearch,setShowSearch] = useState(false)
    let {serverUrl} = useContext(authDataContext)
    let [cartItem, setCartItem] = useState({});
    let [loading,setLoading] = useState(false)
    let [searchResults, setSearchResults] = useState([])
    let [searchLoading, setSearchLoading] = useState(false)
    let currency = '₹';
    let delivery_fee = 40;

    const getProducts = async () => {
        try {
            let result = await axios.get(serverUrl + "/api/product/list")
            console.log(result.data)
            setProducts(result.data)
        } catch (error) {
            console.log(error)
        }
        
    }


    const addtoCart = async (itemId , size) => {
       if (!size) {
      console.log("Select Product Size");
      return;
    }

    let cartData = structuredClone(cartItem); // Clone the product

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
  
    setCartItem(cartData);
  

    if (userData) {
      setLoading(true)
      try {
      let result = await axios.post(serverUrl + "/api/cart/add" , {itemId,size} , {withCredentials: true})
      console.log(result.data)
      toast.success("Product Added")
      setLoading(false)


       
      }
      catch (error) {
        console.log(error)
        setLoading(false)
        toast.error("Add Cart Error")
       
      }
     
    } 
    }


    const getUserCart = async () => {
      if (!userData) {
        return;
      }
      try {
        const result = await axios.post(serverUrl + '/api/cart/get',{},{ withCredentials: true })
        setCartItem(result.data)
      } catch (error) {
        console.log(error)
      }
    }

    const updateQuantity = async (itemId , size , quantity) => {
      let cartData = structuredClone(cartItem);
      cartData[itemId][size] = quantity
      setCartItem(cartData)

      if (userData) {
        try {
          await axios.post(serverUrl + "/api/cart/update", { itemId, size, quantity }, { withCredentials: true })
        } catch (error) {
          console.log(error)
        }
      }
    }

    const getCartCount = () => {
      let totalCount = 0;
      for (const items in cartItem) {
        for (const item in cartItem[items]) {
          try {
            if (cartItem[items][item] > 0) {
              totalCount += cartItem[items][item]
            }
          } catch (error) {
            console.log("Error counting cart items:", error)
          }
        }
      }
      return totalCount
    }

    const getCartAmount = () => {
      let totalAmount = 0;
      for (const items in cartItem) {
        let itemInfo = products.find((product) => product._id === items);
        if (itemInfo) {
          for (const item in cartItem[items]) {
            try {
              if (cartItem[items][item] > 0) {
                totalAmount += itemInfo.price * cartItem[items][item];
              }
            } catch (error) {
              console.log("Error calculating cart amount:", error)
            }
          }
        }
      }
      return totalAmount
    }

    const searchProducts = useCallback((query) => {
      // Validate query - must have at least 2 non-space characters
      const trimmedQuery = query.trim()
      if (!trimmedQuery || trimmedQuery.length < 2) {
        setSearchResults([])
        setSearchLoading(false)
        return
      }

      setSearchLoading(true)
      
      // Debounced search with proper delay
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
        product.subCategory.toLowerCase().includes(trimmedQuery.toLowerCase())
      )
      
      // Small delay to show loading state
      setTimeout(() => {
        setSearchResults(filtered.slice(0, 8)) // Limit to 8 results
        setSearchLoading(false)
      }, 150)
    }, [products])

    useEffect(() => {
      const fetchProducts = async () => {
        try {
          let result = await axios.get(serverUrl + "/api/product/list")
          console.log(result.data)
          setProducts(result.data)
        } catch (error) {
          console.log(error)
        }
      }
      fetchProducts()
    }, [])

    useEffect(() => {
      if (userData) {
        const fetchCart = async () => {
          try {
            const result = await axios.post(serverUrl + '/api/cart/get',{},{ withCredentials: true })
            setCartItem(result.data)
          } catch (error) {
            console.log(error)
          }
        }
        fetchCart()
      }
    },[userData])


    let value = {
      products, currency , delivery_fee,getProducts,search,setSearch,showSearch,setShowSearch,cartItem, addtoCart, getCartCount, setCartItem ,updateQuantity,getCartAmount,loading,searchProducts,searchResults,searchLoading
    }
  return (
    <div>
    <shopDataContext.Provider value={value}>
      {children}
      </shopDataContext.Provider>
    </div>
  )
}

export default ShopContext