import { footerData } from "../data/footer";
import { DribbbleIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from "lucide-react";
import { motion } from "motion/react";
import type { IFooterLink } from "../types";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="mt-24 overflow-hidden py-6 text-[13px] text-gray-500">
            <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-10 px-4 sm:px-6 md:justify-between md:gap-20 lg:px-8">
                <motion.div className="flex flex-wrap items-start gap-10 md:gap-16 lg:gap-24"
                    initial={{ x: -150, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 280, damping: 70, mass: 1 }}
                >
                    <Link to='/'>
                        <img className="size-8 aspect-square" src="/favicon.svg" alt="footer logo" width={32} height={32} />
                    </Link>
                    {footerData.map((section, index) => (
                        <div key={index}>
                            <p className="text-slate-100 font-semibold">{section.title}</p>
                            <ul className="mt-2 space-y-2">
                                {section.links.map((link: IFooterLink, index: number) => (
                                    <li key={index}>
                                        <Link to={link.href} className="hover:text-pink-600 transition">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </motion.div>
                <motion.div className="flex flex-col max-md:items-center max-md:text-center gap-2 items-end"
                    initial={{ x: 150, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 280, damping: 70, mass: 1 }}
                >
                    <p className="max-w-60">Making every customer feel valued—no matter the size of your audience.</p>
                    <div className="flex items-center gap-4 mt-3">
                        <a href="https://dribbble.com/prebuiltui" target="_blank" rel="noreferrer">
                            <DribbbleIcon className="size-5 hover:text-pink-500" />
                        </a>
                        <a href="https://www.linkedin.com/company/prebuiltui" target="_blank" rel="noreferrer">
                            <LinkedinIcon className="size-5 hover:text-pink-500" />
                        </a>
                        <a href="https://x.com/prebuiltui" target="_blank" rel="noreferrer">
                            <TwitterIcon className="size-5 hover:text-pink-500" />
                        </a>
                        <a href="https://www.youtube.com/@prebuiltui" target="_blank" rel="noreferrer">
                            <YoutubeIcon className="size-6 hover:text-pink-500" />
                        </a>
                    </div>
                    <p className="mt-3 text-center">&copy; {new Date().getFullYear()} <a href="https://prebuiltui.com?utm_source=pixels">Thumblify</a></p>
                </motion.div>
            </div>
        </footer>
    );
}