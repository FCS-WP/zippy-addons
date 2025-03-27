import React from 'react'
import Header from '../../Components/Layouts/Header'
import MenuProvider from '../../providers/MenuProvider'
import { Route, Routes, useLocation } from 'react-router'
import Menus from './Menus'
import MenuDetail from './MenuDetail'

const AdminMenus = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = searchParams.get("page");
  const menuId = searchParams.get("id");
  
  return (
    <MenuProvider>
      <Header title="Menu" />
      {page === "menus" && (
        <Routes>
          {!menuId && (<Route path='/wp-admin/admin.php' element={<Menus />} />)}
          {menuId && <Route path="/wp-admin/admin.php" element={<MenuDetail />} />}
        </Routes>
      )}
    </MenuProvider>
  )
}

export default AdminMenus