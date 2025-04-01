import { Box } from '@mui/material'
import React from 'react'
import AddNewMenu from '../../Components/menus/AddNewMenu'
import MenuList from '../../Components/menus/MenuList'
import Header from '../../Components/Layouts/Header'

const Menus = () => {
  return (
    <Box className="menus-wrapped">
        <Header title="Menus" />
        <AddNewMenu />
        <MenuList />
    </Box>
  )
}

export default Menus