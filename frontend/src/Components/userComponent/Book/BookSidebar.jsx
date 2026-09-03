import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../../../config";
import {
  Box,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  Typography,
} from "@mui/material";

const BookSidebar = ({ onFilterChange }) => {
  const [category, setCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [price, setPrice] = useState(25300);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/user/get_category`);
        setCategory(response.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategory();
  }, []);

  useEffect(() => {
    onFilterChange({ category: selectedCategory, price });
  }, [selectedCategory, price, onFilterChange]);

  return (
    <Box
      component="aside"
      className="book-sidebar"
      sx={{
        width: { xs: "100%", md: 280 },
        p: 2.5,
        borderRadius: 3,
        bgcolor: "var(--bg-card)",
        color: "var(--text-primary)",
        border: "1px solid var(--section-border)",
        boxShadow: "var(--card-shadow)",
        backdropFilter: "blur(16px)",
        position: { md: "sticky" },
        top: 24,
        height: "fit-content",
        transition: "all var(--theme-transition)",
      }}
    >
      {/* GENRE */}
      <Box
        sx={{
          border: "1px solid var(--border-color)",
          borderRadius: 2,
          p: 1.25,
          mb: 2,
        }}
      >
        <Button
          fullWidth
          onClick={() => setIsCategoryOpen((prev) => !prev)}
          sx={{
            justifyContent: "space-between",
            color: "var(--text-primary)",
            fontWeight: 700,
            mb: 1,
            textTransform: "none",
          }}
        >
          <span>Genre</span>

          <span>{isCategoryOpen ? "▾" : "▸"}</span>
        </Button>

        {isCategoryOpen && (
          <Box
            sx={{
              maxHeight: 180,
              overflowY: "auto",
              pr: 0.5,

              "&::-webkit-scrollbar": {
                width: "7px",
              },

              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "var(--accent)",
                borderRadius: 999,
              },
            }}
          >
            <RadioGroup
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <FormControlLabel
                value=""
                control={
                  <Radio
                    size="small"
                    sx={{
                      color: "var(--text-muted)",
                      "&.Mui-checked": {
                        color: "var(--accent)",
                      },
                    }}
                  />
                }
                label="All genres"
                sx={{
                  mb: 0.5,
                  color: "var(--text-primary)",
                }}
              />

              {category.map((cat, idx) => (
                <FormControlLabel
                  key={cat._id || idx}
                  value={cat.name}
                  control={
                    <Radio
                      size="small"
                      sx={{
                        color: "var(--text-muted)",
                        "&.Mui-checked": {
                          color: "var(--accent)",
                        },
                      }}
                    />
                  }
                  label={cat.name}
                  sx={{
                    color: "var(--text-primary)",
                  }}
                />
              ))}
            </RadioGroup>

            {category.length > 4 && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 0.5,
                  color: "var(--text-secondary)",
                }}
              >
                Scroll to view more genres
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* PRICE */}
      <Box
        sx={{
          border: "1px solid var(--border-color)",
          borderRadius: 2,
          p: 1.25,
        }}
      >
        <Button
          fullWidth
          onClick={() => setIsPriceOpen((prev) => !prev)}
          sx={{
            justifyContent: "space-between",
            color: "var(--text-primary)",
            fontWeight: 700,
            mb: 1,
            textTransform: "none",
          }}
        >
          <span>Price</span>

          <span>{isPriceOpen ? "▾" : "▸"}</span>
        </Button>

        {isPriceOpen && (
          <Stack spacing={1}>
            <Slider
              value={price}
              min={0}
              max={25300}
              onChange={(_, value) => setPrice(value)}
              sx={{
                color: "var(--accent)",
              }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
                width: "100%",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "var(--text-secondary)",
                }}
              >
                ₹ 0
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                ₹ {price}
              </Typography>
            </Box>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default BookSidebar;
