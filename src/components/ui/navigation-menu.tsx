import React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

interface NavigationMenuItem {
    label: string;
    href?: string;
    items?: {
        title: string;
        href: string;
        description?: string;
    }[];
    callout?: {
        title: string;
        description: string;
        href: string;
        icon?: React.ReactNode;
    };
}

interface NavigationMenuProps {
    landingPage?: boolean;
    items: NavigationMenuItem[];
}

export const NavigationMenu = ({ landingPage, items }: NavigationMenuProps) => {
    return (
        <NavigationMenuPrimitive.Root className={`relative justify-center flex z-1 w-full ${landingPage ? "text-white" : "text-light-primary dark:text-dark-primary"}`}>
            <NavigationMenuPrimitive.List className="flex justify-center items-center gap-6">
                {items.map((item) => (
                    <NavigationMenuPrimitive.Item key={item.label} className="relative">
                        {item.items ? (
                            <>
                                <NavigationMenuPrimitive.Trigger
                                    className={`group inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md
                           
                            ${landingPage ? "hover:bg-[rgba(255,255,255,0.1)] data-[state=open]:text-light-primary dark:data-[state=open]:text-dark-primary" : "hover:bg-light-surface dark:hover:bg-dark-surface "}
                           data-[state=open]:bg-light-surface dark:data-[state=open]:bg-dark-surface
                           focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                >
                                    {item.label}
                                    <ChevronDown
                                        className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
                                        aria-hidden
                                    />
                                </NavigationMenuPrimitive.Trigger>

                                <NavigationMenuPrimitive.Content
                                    className="absolute top-0 left-0 w-[100%] md:w-auto bg-light dark:bg-dark shadow-lg rounded-md
                             animate-in fade-in-0 slide-in-from-left-5 duration-200
                             data-[motion=from-start]:animate-enterFromLeft
                             data-[motion=from-end]:animate-enterFromRight
                             data-[motion=to-start]:animate-exitToLeft
                             data-[motion=to-end]:animate-exitToRight"
                                >
                                    <ul className={`m-0 grid ${item.callout ? "grid-cols-2 w-full md:w-[500px]" : "grid-flow-col grid-rows-3 w-full md:w-[400px]"} list-none gap-2 p-4`}>
                                        {item.callout && (
                                            <li className="row-span-3">

                                                <Link
                                                    to={item.callout.href}
                                                    className="flex flex-col justify-end w-full h-full rounded-md bg-gradient-to-br from-secondary-400 to-secondary-500 p-6 no-underline outline-none focus:shadow-md"
                                                >
                                                    <Logo width={80} height={80} variant="transparent" />
                                                    <div className="mt-4 mb-2 text-lg font-medium text-white">
                                                        {item.callout.title}
                                                    </div>
                                                    <p className="text-sm leading-tight text-white/80">
                                                        {item.callout.description}
                                                    </p>
                                                </Link>
                                            </li>
                                        )}

                                        {item.items.map((subItem) => (
                                            <NavigationMenuPrimitive.Link asChild key={subItem.href}>
                                                <Link
                                                    to={subItem.href}
                                                    className="block select-none rounded-md p-3 
                                   hover:bg-light-surface dark:hover:bg-dark-surface transition-colors duration-200"
                                                >
                                                    <div className="text-base font-medium mb-1 text-light-primary dark:text-dark-primary">
                                                        {subItem.title}
                                                    </div>
                                                    {subItem.description && (
                                                        <p className="text-sm leading-snug text-light-secondary dark:text-dark-secondary">
                                                            {subItem.description}
                                                        </p>
                                                    )}
                                                </Link>
                                            </NavigationMenuPrimitive.Link>
                                        ))}
                                    </ul>
                                </NavigationMenuPrimitive.Content>
                            </>
                        ) : (
                            <NavigationMenuPrimitive.Link asChild>
                                <Link
                                    to={item.href || '/'}
                                    className={`px-3 py-2 text-sm font-medium rounded-md 
                           
                           ${landingPage ? "hover:bg-[rgba(255,255,255,0.1)]" : "hover:bg-light-surface dark:hover:bg-dark-surface "}
                           focus:outline-none focus:ring-2 focus:ring-primary-500
                           transition-colors duration-200
                           `}
                                >
                                    {item.label}
                                </Link>
                            </NavigationMenuPrimitive.Link>
                        )}
                    </NavigationMenuPrimitive.Item>
                ))}
                {/*<NavigationMenuPrimitive.Indicator className="data-[state=visible]:animate-fadeIn
                    data-[state=hidden]:animate-fadeOut
                    top-full z-[1]
                    flex h-[10px]
                    items-end
                    justify-center
                    overflow-hidden
                    transition-[width,transform]
                    duration-[250ms]
                    ease-[ease]">
                    <div className="relative top-[70%] h-[10px] w-[10px] rotate-[45deg] rounded-tl-[2px] bg-light dark:bg-dark" />
                </NavigationMenuPrimitive.Indicator>*/}

            </NavigationMenuPrimitive.List>

            {/* Viewport for dropdown content */}
            <div className="absolute left-0 top-full w-full flex justify-center perspective-[2000px]">
                <NavigationMenuPrimitive.Viewport
                    className="relative mt-2 h-[var(--radix-navigation-menu-viewport-height)]
                       w-full origin-[top_center] rounded-md bg-light dark:bg-dark
                       shadow-lg overflow-hidden
                       transition-[width,height] duration-300 ease-in-out
                       data-[state=open]:animate-in data-[state=closed]:animate-out
                       data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
                       data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
                       sm:w-[var(--radix-navigation-menu-viewport-width)]"
                />
            </div>
        </NavigationMenuPrimitive.Root>
    );
};


