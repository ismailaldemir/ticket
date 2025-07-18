import React from "react";
import { Box, Typography, Paper, Divider, TextField, Button, List, ListItem, ListItemText } from "@mui/material";
// import { useDispatch, useSelector } from "react-redux";
// import { addYorum } from "../../redux/talep/talepSlice";

const TalepYorum = ({ yorumlar }) => {
  // const dispatch = useDispatch();
  // const [yorum, setYorum] = React.useState("");

  return (
    <Paper sx={{ p: 3, maxWidth: 600, margin: "0 auto" }} elevation={1}>
      <Typography variant="h6" gutterBottom>Yorumlar</Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {yorumlar?.length > 0 ? yorumlar.map((y, i) => (
          <ListItem key={i} alignItems="flex-start">
            <ListItemText primary={y.kullanici_ad} secondary={y.metin} />
          </ListItem>
        )) : <Typography>Henüz yorum yok.</Typography>}
      </List>
      <Box sx={{ mt: 2 }}>
        <TextField label="Yorumunuz" fullWidth multiline rows={3} /* value={yorum} onChange={e => setYorum(e.target.value)} */ />
        <Box sx={{ textAlign: "right", mt: 1 }}>
          <Button variant="contained" color="primary">Yorum Ekle</Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default TalepYorum;
