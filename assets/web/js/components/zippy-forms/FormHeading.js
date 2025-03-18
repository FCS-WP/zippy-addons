import { Box, Button, Typography } from '@mui/material'
import React from 'react'

const FormHeading = ({ onBack, title }) => {
    
  return (
    <Box display={"flex"} alignItems={'center'} justifyContent={"space-between"}>
        <Button onClick={()=>onBack()} color="gray">Back</Button>
        <Typography
        variant="h2"
        fontSize={20}
        fontWeight={600}
        textAlign={"center"}
        >
        {title ?? ''}
        </Typography>
        <Button className='btn-close-lightbox' color="gray">Exit</Button>
    </Box>
  )
}

export default FormHeading