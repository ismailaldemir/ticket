import React from "react";
import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
} from "@mui/material";

const ListSkeleton = ({
  rowCount = 5,
  columnCount = 4,
  hasCheckbox = false,
  hasActions = false,
  width,
  height,
  variant,
}) => {
  // Tekil skeleton elementleri için
  if (width && height) {
    return (
      <Skeleton
        variant={variant || "rectangular"}
        width={width}
        height={height}
      />
    );
  }

  // Tablo skeleton'ı için
  const columns = [];
  // Checkbox kolonu ekle
  if (hasCheckbox) {
    columns.push({ id: "checkbox", width: "50px" });
  }

  // İçerik kolonları ekle
  for (let i = 0; i < columnCount; i++) {
    columns.push({
      id: `col-${i}`,
      width: `${100 / (columnCount + (hasActions ? 1 : 0))}%`,
    });
  }

  // İşlem kolonunu ekle
  if (hasActions) {
    columns.push({ id: "actions", width: "100px" });
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id} width={column.width}>
                <Skeleton variant="text" height={30} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array(rowCount)
            .fill(0)
            .map((_, rowIndex) => (
              <TableRow key={`row-${rowIndex}`}>
                {columns.map((column) => (
                  <TableCell key={`${column.id}-${rowIndex}`}>
                    <Skeleton
                      variant="text"
                      height={20}
                      width={column.id === "actions" ? 80 : "100%"}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ListSkeleton;
