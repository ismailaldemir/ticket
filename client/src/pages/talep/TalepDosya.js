import React from "react";
import { Box, Typography, Paper, Divider, Button, List, ListItem, ListItemText } from "@mui/material";
// import { useDispatch, useSelector } from "react-redux";
// import { dosyaEkle } from "../../redux/talep/talepSlice";

const TalepDosya = ({ dosyalar }) => {
  // const dispatch = useDispatch();
  // const [selectedFile, setSelectedFile] = React.useState(null);

  return (
    <Paper sx={{ p: 3, maxWidth: 600, margin: "0 auto" }} elevation={1}>
      <Typography variant="h6" gutterBottom>Ekli Dosyalar</Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {dosyalar?.length > 0 ? dosyalar.map((d, i) => (
          <ListItem key={i}>
            <ListItemText primary={d.ad} secondary={d.url} />
            <Button variant="outlined" color="primary" size="small" href={d.url} target="_blank">İndir</Button>
          </ListItem>
        )) : <Typography>Henüz dosya eklenmemiş.</Typography>}
      </List>
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" component="label" color="primary">
          Dosya Yükle
          <input type="file" hidden /* onChange={e => setSelectedFile(e.target.files[0])} */ />
        </Button>
        {/* <Button variant="contained" color="success" sx={{ ml: 2 }} onClick={() => dispatch(dosyaEkle(selectedFile))}>Yükle</Button> */}
      </Box>
    </Paper>
  );
};

export default TalepDosya;
