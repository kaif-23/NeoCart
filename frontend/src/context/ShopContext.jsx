import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authDataContext } from './AuthContext'
import axios from 'axios'
import { userDataContext } from './UserContext'
import { toast } from 'sonner'

 export const shopDataContext = createContext()
function ShopContext({children}) {
    let [search,setSearch] = useState('')
    let {userData} = useContext(userDataContext)
    let [showSearch,setShowSearch] = useState(false)
    let {serverUrl} = useContext(authDataContext)
    let [cartItem, setCartItem] = useState({});
    let [loading,setLoading] = useState(false)
    let [searchResults, setSearchResults] = useState([])
    let [searchLoading, setSearchLoading] = useState(false)
    let [cartTotals, setCartTotals] = useState({ subTotal: 0, grandTotal: 0, amount: 0, lineItems: [] });
    let currency = '₹';
    let delivery_fee = 40;


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
      return cartTotals.subTotal || 0;
    }

    const searchProducts = useCallback(async (query) => {
      const trimmedQuery = query.trim()
      if (!trimmedQuery || trimmedQuery.length < 2) {
        setSearchResults([])
        setSearchLoading(false)
        return
      }

      setSearchLoading(true)
      try {
        const result = await axios.get(serverUrl + "/api/product/search?q=" + encodeURIComponent(trimmedQuery))
        setSearchResults(result.data)
      } catch (err) {
        console.error("Search error", err)
      } finally {
        setSearchLoading(false)
      }
    }, [serverUrl])


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

    // Fetch live cart totals from backend whenever cartItem changes
    useEffect(() => {
      const fetchCartTotals = async () => {
        // If cart is completely empty, don't ping backend
        if (Object.keys(cartItem).length === 0) {
          setCartTotals({ subTotal: 0, grandTotal: 0, amount: 0, lineItems: [] });
          return;
        }
        try {
          // Pass the local cartItem state so guests can get totals too
          const result = await axios.post(serverUrl + '/api/cart/totals', 
            { cartData: cartItem }, 
            { withCredentials: true }
          );
          if (result.data && Array.isArray(result.data.lineItems)) {
            setCartTotals(result.data);
          } else {
            setCartTotals({ subTotal: 0, grandTotal: 0, amount: 0, lineItems: [] });
          }
        } catch (error) {
          console.error("fetchCartTotals error:", error);
        }
      };
      fetchCartTotals();
    }, [cartItem, serverUrl]);


    let value = {
      currency , delivery_fee, search, setSearch, showSearch, setShowSearch, cartItem, addtoCart, getCartCount, setCartItem, updateQuantity, getCartAmount, cartTotals, loading, searchProducts, searchResults, searchLoading
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