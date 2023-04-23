import React, { useState, useCallback, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { Link } from "react-router-dom";
import "./NavMenu.css";
import { SendRequest } from "../util/AxiosUtil";

export const NavMenu = ({ isAuthorized }) => {
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleSignOut = useCallback(() => {
    SendRequest({
      method: "post",
      url: "auth/sign-out",
    }).then(() => {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user");
      window.location.href = "/auth/sign-in";
    });
  }, []);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" } }}>
            <Link to="/">
              <Button key={0} sx={{ my: 2, color: "white", display: "block" }}>
                Home
              </Button>
            </Link>
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {isAuthorized && (
              <Link to="/game/games">
                <Button
                  key={0}
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  Games
                </Button>
              </Link>
            )}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            {isAuthorized && (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem key={0}>
                    <Typography textAlign="center">Account Settings</Typography>
                  </MenuItem>
                  <MenuItem key={1} onClick={handleSignOut}>
                    <Typography textAlign="center">Sign Out</Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
            {!isAuthorized && (
              <>
                <Link to="/auth/sign-in">
                  <Button
                    key={0}
                    sx={{ my: 2, color: "white", display: "block" }}
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
