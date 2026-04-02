import React, { useState } from "react";

const HomeIconSelected = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5 10V20C5 20.5523 5.44772 21 6 21H9V15C9 13.3431 10.3431 12 12 12C13.6569 12 15 13.3431 15 15V21H18C18.5523 21 19 20.5523 19 20V10L12 3L5 10Z"
      fill="#111"
    />
  </svg>
);

const HomeIconUnselected = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9 21 9 15 12 15C15 15 15 21 15 21M9 21H15"
      stroke="#999"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CircleIconSelected = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="#111" strokeWidth="2.2" />
    <circle cx="12" cy="12" r="4" fill="#111" />
  </svg>
);

const CircleIconUnselected = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="#999" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke="#999" strokeWidth="1.5" />
  </svg>
);

const AddEventIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="13" cy="13" r="12" stroke="#5B4FE8" strokeWidth="1.5" />
    <path d="M13 7V19M7 13H19" stroke="#5B4FE8" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const BellIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15 17H20L18.5951 15.5951C18.2141 15.2141 18 14.6973 18 14.1585V11C18 8.38757 16.3304 6.16509 14 5.34142V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34142C7.66962 6.16509 6 8.38757 6 11V14.1585C6 14.6973 5.78595 15.2141 5.40493 15.5951L4 17H9M15 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17"
      stroke="#999"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ProfileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="#999" strokeWidth="2" />
    <path
      d="M4 20C4 17.2386 7.58172 15 12 15C16.4183 15 20 17.2386 20 20"
      stroke="#999"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

type TabId = "home" | "circle" | "add" | "bell" | "profile";

interface Tab {
  id: TabId;
  label: string;
  isAdd?: boolean;
  Selected?: () => React.ReactElement;
  Unselected?: () => React.ReactElement;
  Icon?: () => React.ReactElement;
}

const tabs: Tab[] = [
  { id: "home", label: "Home", Selected: HomeIconSelected, Unselected: HomeIconUnselected },
  { id: "circle", label: "Explore", Selected: CircleIconSelected, Unselected: CircleIconUnselected },
  { id: "add", label: "Add", isAdd: true },
  { id: "bell", label: "Alerts", Icon: BellIcon },
  { id: "profile", label: "Profile", Icon: ProfileIcon },
];

export default function Navbar() {
  const [active, setActive] = useState<TabId>("home");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f0f0",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: "40px",
      }}
    >
      <nav
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 4px 30px rgba(0,0,0,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 24px",
          width: "340px",
        }}
      >
        {tabs.map((tab) => {
          if (tab.isAdd) {
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                aria-label={tab.label}
                style={{
                  background: "#e8e4ff",
                  border: "none",
                  borderRadius: "50%",
                  width: "52px",
                  height: "52px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "transform 0.15s, background 0.2s",
                  transform: active === tab.id ? "scale(1.08)" : "scale(1)",
                  outline: "none",
                  flexShrink: 0,
                }}
              >
                <AddEventIcon />
              </button>
            );
          }

          const isActive = active === tab.id;
          const IconComponent =
            isActive && tab.Selected
              ? tab.Selected
              : tab.Unselected
              ? tab.Unselected
              : tab.Icon!;

          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              aria-label={tab.label}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                transition: "transform 0.15s",
                transform: isActive ? "scale(1.1)" : "scale(1)",
                outline: "none",
                flexShrink: 0,
              }}
            >
              <IconComponent />
            </button>
          );
        })}
      </nav>
    </div>
  );
}