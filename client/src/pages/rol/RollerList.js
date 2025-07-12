import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getRoller } from "../actions/rolActions"; // Roller için gerekli aksiyonları import et
import { Button } from "reactstrap"; // Kullanılacak UI bileşenlerini import et

const RollerList = () => {
  const dispatch = useDispatch();
  const { roller, loading } = useSelector((state) => state.rol);
  const { user } = useSelector((state) => state.auth); // auth state'inden user bilgisini al

  // Admin kontrolü için yardımcı fonksiyon
  const isAdmin = () => {
    return user && user.role === "admin";
  };

  // Düzenle/Sil butonlarının durumunu belirle
  const canEditDelete = isAdmin();

  useEffect(() => {
    dispatch(getRoller());
  }, [dispatch]);

  const handleEdit = (id) => {
    // Düzenleme işlemleri için gerekli kodlar
    console.log(`Rol düzenleniyor: ${id}`);
  };

  const handleDelete = (id) => {
    // Silme işlemleri için gerekli kodlar
    console.log(`Rol siliniyor: ${id}`);
  };

  return (
    <div>
      <h2>Roller Listesi</h2>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <ul>
          {roller.map((rol) => (
            <li key={rol._id}>
              {rol.name}
              <Button
                disabled={!canEditDelete}
                onClick={() => handleEdit(rol._id)}
              >
                Düzenle
              </Button>
              <Button
                disabled={!canEditDelete}
                onClick={() => handleDelete(rol._id)}
              >
                Sil
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RollerList;
