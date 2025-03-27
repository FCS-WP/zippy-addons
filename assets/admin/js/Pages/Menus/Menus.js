import { Box } from '@mui/material'
import React from 'react'
import AddNewMenu from '../../Components/menus/AddNewMenu'
import MenuList from '../../Components/menus/MenuList'

const Menus = () => {
  return (
    <Box className="menus-wrapped">
        <AddNewMenu />
        <MenuList />
    </Box>
  )
}

export default Menus