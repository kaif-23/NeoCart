import React, { useContext } from 'react'
import Nav from '../component/Nav'
import Sidebar from '../component/Sidebar'
import upload from '../assets/upload image.jpg'
import { useState } from 'react'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../component/Loading'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Paper,
  IconButton,
  Divider,
  InputAdornment
} from '@mui/material'
import {
  CloudUpload,
  Add as AddIcon,
  Save,
  Cancel,
  Image as ImageIcon,
  Category,
  Inventory,
  MonetizationOn,
  Description
} from '@mui/icons-material'

function Add() {
  let location = useLocation()
  let navigate = useNavigate()
  let { editMode, productData } = location.state || {}

  let [image1,setImage1] = useState(false)
  let [image2,setImage2] = useState(false)
  let [image3,setImage3] = useState(false)
  let [image4,setImage4] = useState(false)
  const [name, setName] = useState(editMode && productData ? productData.name || "" : "")
  const [description, setDescription] = useState(editMode && productData ? productData.description || "" : "")
  const [category, setCategory] = useState(editMode && productData ? productData.category || "Men" : "Men")
  const [price, setPrice] = useState(editMode && productData ? productData.price || "" : "")
  const [subCategory, setSubCategory] = useState(editMode && productData ? productData.subCategory || "TopWear" : "TopWear")
  const [bestseller, setBestSeller] = useState(editMode && productData ? productData.bestseller || false : false)
  const [sizes,setSizes] = useState(editMode && productData ? productData.sizes || [] : [])
  const [inventory, setInventory] = useState(editMode && productData && productData.inventory ? productData.inventory : {})
  const [loading,setLoading] = useState(false)
  let {serverUrl} = useContext(authDataContext)

  // Update inventory when sizes change
  const handleSizeToggle = (size) => {
    if (sizes.includes(size)) {
      // Remove size
      setSizes(prev => prev.filter(item => item !== size))
      // Remove from inventory
      setInventory(prev => {
        const newInv = {...prev}
        delete newInv[size]
        return newInv
      })
    } else {
      // Add size
      setSizes(prev => [...prev, size])
      // Add to inventory with default values
      setInventory(prev => ({
        ...prev,
        [size]: prev[size] || { stock: 100, available: true }
      }))
    }
  }

  const handleInventoryChange = (size, field, value) => {
    setInventory(prev => ({
      ...prev,
      [size]: {
        ...prev[size],
        [field]: field === 'stock' ? Number(value) : value === 'true'
      }
    }))
  }

  const handleAddProduct = async (e) => {
    setLoading(true)
    e.preventDefault()
    try {
      let formData = new FormData()
      formData.append("name",name)
      formData.append("description",description)
      formData.append("price",price)
      formData.append("category",category)
      formData.append("subCategory",subCategory)
      formData.append("bestseller",bestseller)
      formData.append("sizes",JSON.stringify(sizes))
      formData.append("inventory",JSON.stringify(inventory))

      // Handle images - only append new images if selected
      if (image1) formData.append("image1",image1)
      if (image2) formData.append("image2",image2)
      if (image3) formData.append("image3",image3)
      if (image4) formData.append("image4",image4)

      let result

      if (editMode && productData) {
        // Update existing product
        formData.append("productId", productData._id)
        result = await axios.put(serverUrl + "/api/product/update/" + productData._id, formData, {withCredentials:true})
        toast.success("Product Updated Successfully")
      } else {
        // Add new product
        result = await axios.post(serverUrl + "/api/product/addproduct", formData, {withCredentials:true})
        toast.success("Product Added Successfully")
      }

      setLoading(false)

      if(result.data){
        // Reset form
        setName("")
        setDescription("")
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
        setPrice("")
        setBestSeller(false)
        setCategory("Men")
        setSubCategory("TopWear")
        setSizes([])
        setInventory({})
        
        // Navigate back to lists after editing
        if (editMode) {
          navigate('/lists')
        }
      }

      
    } catch (error) {
       setLoading(false)
       toast.error(editMode ? "Update Product Failed" : "Add Product Failed")
    }

    
  }
  return (
    <div className='w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] text-white overflow-x-hidden'>
      <Nav/>
      <Sidebar/>

      <Box sx={{ 
        width: '82%', 
        marginLeft: 'auto', 
        marginTop: '70px',
        padding: { xs: 2, md: 4 },
        paddingTop: { xs: 4, md: 6 }
      }}>
        <Paper 
          elevation={6}
          sx={{ 
            maxWidth: 1200, 
            margin: '0 auto',
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: 3,
            color: 'white'
          }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              {editMode ? '✏️ Edit Product' : <AddIcon />}
              {editMode ? 'Edit Product' : 'Add New Product'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              {editMode ? 'Update product information' : 'Fill in the details to add a new product'}
            </Typography>
          </Box>

          <form onSubmit={handleAddProduct}>
            <CardContent sx={{ padding: { xs: 2, md: 4 } }}>
              
              {/* Image Upload Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#667eea' }}>
                  <ImageIcon /> Product Images
                  {editMode && <Typography variant="caption" sx={{ color: 'gray', ml: 1 }}>(Leave blank to keep existing)</Typography>}
                </Typography>
                <Grid container spacing={2}>
                  {[1, 2, 3, 4].map((num) => {
                    const imageState = eval(`image${num}`)
                    const setImageState = eval(`setImage${num}`)
                    const existingImage = editMode && productData?.[`image${num}`]
                    
                    return (
                      <Grid item xs={6} sm={3} key={num}>
                        <label htmlFor={`image${num}`}>
                          <Paper
                            elevation={3}
                            sx={{
                              aspectRatio: '1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              transition: 'transform 0.2s',
                              '&:hover': { transform: 'scale(1.05)', borderColor: '#667eea' },
                              border: '2px dashed #667eea',
                              backgroundColor: 'rgba(102, 126, 234, 0.1)'
                            }}
                          >
                            {imageState || existingImage ? (
                              <img
                                src={imageState ? URL.createObjectURL(imageState) : existingImage}
                                alt={`Product ${num}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <Box sx={{ textAlign: 'center', color: '#667eea' }}>
                                <CloudUpload sx={{ fontSize: 40, mb: 1 }} />
                                <Typography variant="caption">Upload Image {num}</Typography>
                              </Box>
                            )}
                          </Paper>
                          <input
                            type="file"
                            id={`image${num}`}
                            hidden
                            onChange={(e) => setImageState(e.target.files[0])}
                            {...(!editMode && {required: true})}
                          />
                        </label>
                      </Grid>
                    )
                  })}
                </Grid>
              </Box>

              <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

              {/* Product Name */}
              <TextField
                fullWidth
                label="Product Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: '#667eea' },
                    '&.Mui-focused fieldset': { borderColor: '#667eea' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Category sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Product Description */}
              <TextField
                fullWidth
                label="Product Description"
                variant="outlined"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: '#667eea' },
                    '&.Mui-focused fieldset': { borderColor: '#667eea' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Category and Sub-Category */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-focused': { color: '#667eea' } }}>
                      Category
                    </InputLabel>
                    <Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      label="Category"
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                        '& .MuiSvgIcon-root': { color: 'white' }
                      }}
                    >
                      <MenuItem value="Men">Men</MenuItem>
                      <MenuItem value="Women">Women</MenuItem>
                      <MenuItem value="Kids">Kids</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-focused': { color: '#667eea' } }}>
                      Sub-Category
                    </InputLabel>
                    <Select
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      label="Sub-Category"
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                        '& .MuiSvgIcon-root': { color: 'white' }
                      }}
                    >
                      <MenuItem value="TopWear">TopWear</MenuItem>
                      <MenuItem value="BottomWear">BottomWear</MenuItem>
                      <MenuItem value="WinterWear">WinterWear</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Product Price */}
              <TextField
                fullWidth
                label="Product Price"
                variant="outlined"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: '#667eea' },
                    '&.Mui-focused fieldset': { borderColor: '#667eea' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MonetizationOn sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Product Sizes */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#667eea' }}>
                  Product Sizes
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <Chip
                      key={size}
                      label={size}
                      onClick={() => handleSizeToggle(size)}
                      color={sizes.includes(size) ? 'primary' : 'default'}
                      sx={{
                        fontSize: '16px',
                        padding: '20px 10px',
                        backgroundColor: sizes.includes(size) ? '#667eea' : 'rgba(255,255,255,0.1)',
                        color: 'white',
                        border: sizes.includes(size) ? '2px solid #667eea' : '2px solid rgba(255,255,255,0.3)',
                        '&:hover': { backgroundColor: sizes.includes(size) ? '#5568d3' : 'rgba(255,255,255,0.2)' }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Stock Management */}
              {sizes.length > 0 && (
                <Card sx={{ mb: 3, backgroundColor: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.3)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#667eea' }}>
                      <Inventory /> Stock Management
                    </Typography>
                    <Grid container spacing={2}>
                      {sizes.map(size => (
                        <Grid item xs={12} sm={6} key={size}>
                          <Card sx={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <CardContent>
                              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'white' }}>
                                Size: {size}
                              </Typography>
                              <TextField
                                fullWidth
                                label="Stock Quantity"
                                type="number"
                                size="small"
                                value={inventory[size]?.stock || 0}
                                onChange={(e) => handleInventoryChange(size, 'stock', e.target.value)}
                                sx={{ 
                                  mb: 2,
                                  '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                    '&:hover fieldset': { borderColor: '#667eea' }
                                  },
                                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                                }}
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={inventory[size]?.available !== false}
                                    onChange={(e) => handleInventoryChange(size, 'available', e.target.checked.toString())}
                                    sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-checked': { color: '#667eea' } }}
                                  />
                                }
                                label="Available for sale"
                                sx={{ color: 'white' }}
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Bestseller Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={bestseller}
                    onChange={() => setBestSeller(prev => !prev)}
                    sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      '&.Mui-checked': { color: '#FFD700' }
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                    ⭐ {editMode ? 'Bestseller' : 'Add to Bestseller'}
                  </Typography>
                }
                sx={{ mb: 3 }}
              />

              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={loading ? null : (editMode ? <Save /> : <AddIcon />)}
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '12px 32px',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #653a8a 100%)',
                    },
                    '&:disabled': {
                      background: 'rgba(255,255,255,0.3)',
                    }
                  }}
                >
                  {loading ? <Loading /> : (editMode ? 'Update Product' : 'Add Product')}
                </Button>

                {editMode && (
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Cancel />}
                    onClick={() => navigate('/lists')}
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.3)',
                      fontWeight: 'bold',
                      padding: '12px 32px',
                      '&:hover': {
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            </CardContent>
          </form>
        </Paper>
      </Box>
    </div>
  )
}

export default Add
