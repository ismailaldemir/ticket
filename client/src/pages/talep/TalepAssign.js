import React from "react";
import { Box, Typography, Paper, Divider, Grid, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
// import { useDispatch, useSelector } from "react-redux";
// import { atamaYap } from "../../redux/talep/talepSlice";

const TalepAssign = ({ talep, yetkililer }) => {
  // const dispatch = useDispatch();
  // const [selectedUser, setSelectedUser] = React.useState("");

  return (
    <Paper sx={{ p: 3, maxWidth: 500, margin: "0 auto" }} elevation={2}>
      <Typography variant="h6" gutterBottom>Talep Atama</Typography>
      <Divider sx={{ mb: 2 }} />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Yetkili Seç</InputLabel>
        <Select /* value={selectedUser} onChange={e => setSelectedUser(e.target.value)} */ label="Yetkili Seç">
          {yetkililer?.map((user) => (
            <MenuItem key={user.id} value={user.id}>{user.ad}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ textAlign: "right" }}>
        <Button variant="contained" color="primary">Atama Yap</Button>
      </Box>
    </Paper>
  );
};

export default TalepAssign;
