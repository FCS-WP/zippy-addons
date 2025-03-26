import React from 'react'
import Header from '../../Components/Layouts/Header'
import { Box } from '@mui/material'
import AddNewMenu from '../../Components/menus/AddNewMenu'
import MenuList from '../../Components/menus/MenuList'
import MenuProvider from '../../providers/MenuProvider'

const AdminMenus = () => {
  return (
    <MenuProvider>
      <Header title="Menu" />
      <Box className="menus-wrapped">
        <AddNewMenu />
        <MenuList />
      </Box>
    </MenuProvider>
  )
}

export default AdminMenus