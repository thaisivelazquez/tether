import React, { useState } from "react";

type TabId = "home" | "circle" | "add" | "bell" | "profile";

interface Tab {
  id: TabId;
  label: string;
  isAdd?: boolean;
  selected?: string;
  unselected?: string;
}

const tabs: Tab[] = [
  {
    id: "home",
    label: "Home",
    selected: "/components/navbar/homeiconselected.svg",
    unselected: "/components/navbar/homeiconunselected.svg",
  },
  {
    id: "circle",
    label: "Explore",
    selected: "/components/navbar/circleiconselected.svg",
    unselected: "/components/navbar/circleiconunselected.svg",
  },
  {
    id: "add",
    label: "Add",
    isAdd: true,
  },
  {
    id: "bell",
    label: "Alerts",
    selected: "/components/navbar/bellunselected.svg",
    unselected: "/components/navbar/bellunselected.svg",
  },
  {
    id: "profile",
    label: "Profile",
    selected: "/components/navbar/pficonselected.svg",
    unselected: "/components/navbar/pficonunselected.svg",
  },
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
                aria-label="Add"
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
                  transition: "transform 0.15s",
                  transform: active === tab.id ? "scale(1.08)" : "scale(1)",
                  outline: "none",
                  flexShrink: 0,
                }}
              >
                <img src="/components/navbar/addevent.svg" alt="Add" width={26} height={26} />
              </button>
            );
          }

          const isActive = active === tab.id;
          const src = isActive ? tab.selected! : tab.unselected!;

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
              <img src={src} alt={tab.label} width={24} height={24} />
            </button>
          );
        })}
      </nav>
    </div>
  );
}