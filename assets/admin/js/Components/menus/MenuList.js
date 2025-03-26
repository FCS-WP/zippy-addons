import React from 'react'
import { Grid2 } from '@mui/material'
import MenuControl from './MenuControl'
import MenuProducts from './MenuProducts'

const MenuList = () => {
  return (
    <Grid2 container spacing={3}>
      <Grid2 size={{ xs: 12, md: 8 }}>
        <MenuControl />
      </Grid2>
      <Grid2 size={{ xs: 12, md: 4 }}>
        <MenuProducts />
      </Grid2>
    </Grid2>
  )
}

export default MenuList