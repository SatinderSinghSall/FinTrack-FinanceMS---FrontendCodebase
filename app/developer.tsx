import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons, FontAwesome5, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";

export default function Developer() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const isDark = colorScheme === "dark";

  const socials = [
    {
      label: "GitHub",
      icon: "logo-github",
      url: "https://github.com/SatinderSinghSall",
      color: "#111827",
      description: "Code & open-source work",
    },
    {
      label: "LinkedIn",
      icon: "logo-linkedin",
      url: "https://www.linkedin.com/in/satinder-singh-sall-b62049204",
      color: "#2563EB",
      description: "Professional profile",
    },
    {
      label: "X / Twitter",
      icon: "logo-twitter",
      url: "https://x.com/SallSatinder",
      color: "#0F172A",
      description: "Thoughts & updates",
    },
    {
      label: "YouTube",
      icon: "logo-youtube",
      url: "https://www.youtube.com/@satindersinghsall.3841/featured",
      color: "#DC2626",
      description: "Videos & tutorials",
    },
    {
      label: "Portfolio",
      icon: "earth",
      url: "https://satinder-portfolio.vercel.app",
      color: "#059669",
      description: "Projects & experience",
    },
  ];

  const skillSections = [
    {
      title: "Frontend & Mobile",
      icon: "phone-portrait-outline",
      skills: [
        "React",
        "Next.js",
        "React Native",
        "Expo",
        "TypeScript",
        "Redux",
        "TailwindCSS",
        "HTML5",
        "CSS3",
      ],
    },
    {
      title: "Backend & APIs",
      icon: "server-outline",
      skills: [
        "Node.js",
        "Express.js",
        "REST APIs",
        "JWT Authentication",
        "API Security",
        "MongoDB",
        "MySQL",
        "PostgreSQL",
        "Firebase",
      ],
    },
    {
      title: "DevOps & Cloud",
      icon: "cloud-outline",
      skills: [
        "Docker",
        "CI/CD",
        "GitHub",
        "Vercel",
        "Render",
        "Cloud Deployment",
        "Linux",
      ],
    },
    {
      title: "AI / ML Engineering",
      icon: "sparkles-outline",
      skills: [
        "Python",
        "NumPy",
        "Pandas",
        "Matplotlib",
        "Scikit-learn",
        "PyTorch",
        "Transformers",
        "RAG",
        "Agentic AI",
        "OpenAI APIs",
        "CNN",
        "RNN",
        "LSTM",
        "Deep Learning",
        "Data Visualization",
      ],
    },
    {
      title: "Programming Languages",
      icon: "code-slash-outline",
      skills: [
        "JavaScript",
        "TypeScript",
        "Python",
        "Java",
        "C",
        "C++",
        "C#",
        "Kotlin",
      ],
    },
  ];

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-[#020617]" : "bg-[#F6F8FC]"}`}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 70,
        }}
      >
        {/* ====================================================== */}
        {/* HEADER */}
        {/* ====================================================== */}

        <View
          className={`flex-row items-center justify-between px-5 pt-3 pb-4 ${
            isDark ? "bg-[#020617]" : "bg-[#F6F8FC]"
          }`}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className={`w-11 h-11 rounded-[15px] items-center justify-center border ${
              isDark
                ? "bg-[#0F172A] border-[#1E293B]"
                : "bg-white border-[#E7ECF3]"
            }`}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={isDark ? "#F8FAFC" : "#0F172A"}
            />
          </TouchableOpacity>

          <View className="items-center">
            <Text
              className={`text-[15px] font-bold ${
                isDark ? "text-white" : "text-[#0F172A]"
              }`}
            >
              About Me
            </Text>

            <Text
              className={`text-[10px] mt-0.5 ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Developer profile
            </Text>
          </View>

          <TouchableOpacity
            onPress={toggleColorScheme}
            activeOpacity={0.8}
            className={`w-11 h-11 rounded-[15px] items-center justify-center border ${
              isDark
                ? "bg-[#0F172A] border-[#1E293B]"
                : "bg-white border-[#E7ECF3]"
            }`}
          >
            <Ionicons
              name={isDark ? "sunny-outline" : "moon-outline"}
              size={20}
              color={isDark ? "#FBBF24" : "#475569"}
            />
          </TouchableOpacity>
        </View>

        {/* ====================================================== */}
        {/* HERO */}
        {/* ====================================================== */}

        <View className="px-5 pt-3">
          <View
            className="rounded-[30px] overflow-hidden"
            style={{
              backgroundColor: isDark ? "#0B1730" : "#0B2345",
              shadowColor: "#0B2345",
              shadowOffset: {
                width: 0,
                height: 12,
              },
              shadowOpacity: isDark ? 0.3 : 0.16,
              shadowRadius: 24,
              elevation: 8,
            }}
          >
            {/* DECORATIVE CIRCLES */}
            <View
              className="absolute w-56 h-56 rounded-full"
              style={{
                right: -100,
                top: -90,
                backgroundColor: "rgba(59,130,246,0.14)",
              }}
            />

            <View
              className="absolute w-40 h-40 rounded-full"
              style={{
                left: -100,
                bottom: -80,
                backgroundColor: "rgba(99,102,241,0.10)",
              }}
            />

            <View className="px-6 pt-7 pb-7">
              {/* TOP ROW */}
              <View className="flex-row items-center justify-between">
                <View
                  className="w-[68px] h-[68px] rounded-[22px] items-center justify-center"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.10)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.12)",
                  }}
                >
                  <Ionicons name="code-slash" size={31} color="#FFFFFF" />
                </View>

                <View className="px-3 py-2 rounded-full bg-white/10 border border-white/10">
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-emerald-400 mr-2" />

                    <Text className="text-[10px] font-bold tracking-[0.7px] text-slate-200">
                      BUILDING & SHIPPING
                    </Text>
                  </View>
                </View>
              </View>

              {/* NAME */}
              <Text className="text-[34px] leading-[40px] font-extrabold text-white mt-7 tracking-[-0.8px]">
                Satinder Singh Sall
              </Text>

              {/* ROLE */}
              <Text className="text-[17px] font-semibold text-[#93B4FF] mt-2">
                Full-Stack Product Engineer
              </Text>

              {/* DESCRIPTION */}
              <Text className="text-[14px] leading-[23px] text-slate-300 mt-4">
                Building scalable, production-ready digital products across
                mobile, web, backend, cloud, and AI/ML.
              </Text>

              {/* MINI STATS */}
              <View className="flex-row mt-7">
                <HeroStat value="Full-Stack" label="Engineering" />

                <HeroStat value="Mobile" label="React Native" />

                <HeroStat value="AI / ML" label="Intelligent systems" />
              </View>

              {/* PORTFOLIO CTA */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  Linking.openURL("https://satinder-portfolio.vercel.app")
                }
                className="self-start flex-row items-center mt-6 px-4 py-3 rounded-[14px]"
                style={{
                  backgroundColor: "#FFFFFF",
                }}
              >
                <View className="w-8 h-8 rounded-[10px] bg-[#EFF6FF] items-center justify-center mr-3">
                  <Ionicons name="globe-outline" size={17} color="#2563EB" />
                </View>

                <View>
                  <Text className="text-[12px] font-extrabold text-[#0F172A]">
                    View My Portfolio
                  </Text>

                  <Text className="text-[9px] text-[#64748B] mt-0.5">
                    Projects · Experience · Work
                  </Text>
                </View>

                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#2563EB"
                  style={{ marginLeft: 14 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ====================================================== */}
        {/* ABOUT */}
        {/* ====================================================== */}

        <SectionHeading
          eyebrow="THE PERSON BEHIND FINTRACK"
          title="About Me"
          subtitle="Engineering products that are useful, scalable, and built to last."
          isDark={isDark}
        />

        <View className="px-5">
          <PremiumCard isDark={isDark}>
            <Text
              className={`text-[15px] leading-[26px] ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              I build scalable, production-ready digital products with a focus
              on performance, maintainability, and clean architecture.
            </Text>

            <Text
              className={`text-[15px] leading-[26px] mt-5 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              My expertise spans full-stack development, mobile engineering,
              backend systems, DevOps, cloud infrastructure, and AI-powered
              applications using React, React Native, Node.js, Express,
              TypeScript, MongoDB, SQL systems, Docker, and modern deployment
              workflows.
            </Text>

            <View
              className={`h-px my-6 ${
                isDark ? "bg-slate-800" : "bg-slate-100"
              }`}
            />

            <View className="flex-row items-start">
              <View
                className="w-10 h-10 rounded-[13px] items-center justify-center mr-3"
                style={{
                  backgroundColor: isDark ? "#172554" : "#EFF6FF",
                }}
              >
                <Ionicons name="school-outline" size={19} color="#2563EB" />
              </View>

              <View className="flex-1">
                <Text
                  className={`text-[13px] font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Currently learning & building
                </Text>

                <Text
                  className={`text-[13px] leading-5 mt-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Pursuing MCA at KiiT University while expanding into AI
                  engineering, intelligent systems, and game development.
                </Text>
              </View>
            </View>
          </PremiumCard>
        </View>

        {/* ====================================================== */}
        {/* WHAT I BUILD */}
        {/* ====================================================== */}

        <SectionHeading
          eyebrow="WHAT I BUILD"
          title="Products, not just code."
          subtitle="From idea to production — architecture, engineering, and deployment."
          isDark={isDark}
        />

        <View className="px-5">
          <View className="flex-row flex-wrap justify-between">
            <ServiceCard
              icon="code-slash-outline"
              title="Web Development"
              subtitle="React · Next.js · TypeScript"
              description="Modern, responsive, and scalable web applications built around clean architecture."
              isDark={isDark}
            />

            <ServiceCard
              icon="phone-portrait-outline"
              title="Mobile Apps"
              subtitle="React Native · Expo"
              description="Smooth cross-platform applications with polished UX and native-like performance."
              isDark={isDark}
            />

            <ServiceCard
              icon="layers-outline"
              title="Full Stack"
              subtitle="Frontend · Backend · APIs"
              description="Complete product systems covering APIs, databases, authentication, and deployment."
              isDark={isDark}
            />

            <ServiceCard
              icon="hardware-chip-outline"
              title="AI / ML"
              subtitle="GenAI · ML · Intelligent Systems"
              description="AI-powered products using ML, Deep Learning, OpenAI APIs, RAG, and intelligent workflows."
              isDark={isDark}
            />

            <ServiceCard
              icon="git-network-outline"
              title="RAG & Agents"
              subtitle="LLMs · Automation"
              description="Context-aware AI systems, retrieval pipelines, agents, and intelligent automation."
              isDark={isDark}
            />

            <ServiceCard
              icon="cloud-outline"
              title="DevOps & Cloud"
              subtitle="Docker · CI/CD · Cloud"
              description="Reliable deployment workflows, containerized infrastructure, and cloud systems."
              isDark={isDark}
            />
          </View>
        </View>

        {/* ====================================================== */}
        {/* FOCUS AREAS */}
        {/* ====================================================== */}

        <SectionHeading
          eyebrow="ENGINEERING FOCUS"
          title="What I care about"
          subtitle="The principles behind the products I build."
          isDark={isDark}
        />

        <View className="px-5">
          <PremiumCard isDark={isDark}>
            <FocusPoint
              icon="layers-outline"
              title="Clean Architecture"
              desc="Systems designed to stay maintainable as products grow."
              isDark={isDark}
            />

            <FocusPoint
              icon="speedometer-outline"
              title="Performance"
              desc="Fast interfaces, efficient APIs, and responsive experiences."
              isDark={isDark}
            />

            <FocusPoint
              icon="shield-checkmark-outline"
              title="Security"
              desc="Authentication, authorization, API security, and protected data."
              isDark={isDark}
            />

            <FocusPoint
              icon="cloud-outline"
              title="Production Engineering"
              desc="Deployment, CI/CD, cloud infrastructure, monitoring, and reliability."
              isDark={isDark}
              last
            />
          </PremiumCard>
        </View>

        {/* ====================================================== */}
        {/* SKILLS */}
        {/* ====================================================== */}

        <SectionHeading
          eyebrow="TECH STACK"
          title="Skills & Technologies"
          subtitle="Tools and technologies I work with."
          isDark={isDark}
        />

        <View className="px-5">
          {skillSections.map((section) => (
            <SkillSection
              key={section.title}
              section={section}
              isDark={isDark}
            />
          ))}
        </View>

        {/* ====================================================== */}
        {/* CONNECT */}
        {/* ====================================================== */}

        <SectionHeading
          eyebrow="LET'S CONNECT"
          title="Find me online."
          subtitle="Explore my work, projects, and professional journey."
          isDark={isDark}
        />

        <View className="px-5">
          {socials.map((social) => (
            <TouchableOpacity
              key={social.label}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(social.url)}
              className={`flex-row items-center px-4 py-4 rounded-[18px] mb-3 border ${
                isDark
                  ? "bg-[#0F172A] border-[#1E293B]"
                  : "bg-white border-[#E8EDF4]"
              }`}
            >
              {/* ICON */}
              <View
                className="w-11 h-11 rounded-[14px] items-center justify-center"
                style={{
                  backgroundColor: social.color,
                }}
              >
                <Ionicons name={social.icon as any} size={21} color="#FFFFFF" />
              </View>

              {/* TEXT */}
              <View className="flex-1 ml-3">
                <Text
                  className={`text-[14px] font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {social.label}
                </Text>

                <Text
                  className={`text-[11px] mt-1 ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  {social.description}
                </Text>
              </View>

              <View
                className={`w-9 h-9 rounded-full items-center justify-center ${
                  isDark ? "bg-slate-800" : "bg-slate-50"
                }`}
              >
                <Ionicons
                  name="arrow-up-outline"
                  size={17}
                  color={isDark ? "#CBD5E1" : "#64748B"}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ====================================================== */}
        {/* FOOTER */}
        {/* ====================================================== */}

        <View className="items-center px-7 pt-8">
          <View
            className="w-10 h-10 rounded-[13px] items-center justify-center mb-3"
            style={{
              backgroundColor: isDark ? "#172554" : "#EFF6FF",
            }}
          >
            <Ionicons name="code-slash-outline" size={18} color="#2563EB" />
          </View>

          <Text
            className={`text-[13px] text-center leading-5 ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Building scalable digital products with engineering, AI, cloud, and
            performance in mind.
          </Text>

          <Text
            className={`text-[10px] mt-3 ${
              isDark ? "text-slate-700" : "text-slate-300"
            }`}
          >
            FinTrack • Developer Profile
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================================================================ */
/* HERO STAT */
/* ================================================================ */

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1">
      <Text className="text-[12px] font-bold text-white">{value}</Text>

      <Text className="text-[9px] text-slate-400 mt-1">{label}</Text>
    </View>
  );
}

/* ================================================================ */
/* SECTION HEADING */
/* ================================================================ */

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  isDark,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  isDark: boolean;
}) {
  return (
    <View className="px-5 pt-10 pb-5">
      <Text
        className={`text-[10px] font-extrabold tracking-[1.5px] ${
          isDark ? "text-blue-400" : "text-blue-600"
        }`}
      >
        {eyebrow}
      </Text>

      <Text
        className={`text-[25px] leading-[31px] font-extrabold tracking-[-0.4px] mt-2 ${
          isDark ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </Text>

      <Text
        className={`text-[13px] leading-5 mt-2 ${
          isDark ? "text-slate-500" : "text-slate-500"
        }`}
      >
        {subtitle}
      </Text>
    </View>
  );
}

/* ================================================================ */
/* PREMIUM CARD */
/* ================================================================ */

function PremiumCard({
  children,
  isDark,
}: {
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <View
      className={`rounded-[24px] p-5 border ${
        isDark ? "bg-[#0F172A] border-[#1E293B]" : "bg-white border-[#E8EDF4]"
      }`}
      style={{
        shadowColor: "#0F172A",
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: isDark ? 0 : 0.04,
        shadowRadius: 16,
        elevation: isDark ? 0 : 2,
      }}
    >
      {children}
    </View>
  );
}

/* ================================================================ */
/* SERVICE CARD */
/* ================================================================ */

function ServiceCard({
  icon,
  title,
  subtitle,
  description,
  isDark,
}: {
  icon: any;
  title: string;
  subtitle: string;
  description: string;
  isDark: boolean;
}) {
  return (
    <View
      className={`w-[48.2%] rounded-[23px] p-4 mb-3 border ${
        isDark ? "bg-[#0F172A] border-[#1E293B]" : "bg-white border-[#E8EDF4]"
      }`}
      style={{
        minHeight: 205,
        shadowColor: "#2563EB",
        shadowOffset: {
          width: 0,
          height: 5,
        },
        shadowOpacity: isDark ? 0 : 0.035,
        shadowRadius: 12,
        elevation: isDark ? 0 : 2,
      }}
    >
      <View
        className="w-11 h-11 rounded-[14px] items-center justify-center mb-4"
        style={{
          backgroundColor: isDark ? "#172554" : "#EFF6FF",
        }}
      >
        <Ionicons
          name={icon}
          size={21}
          color={isDark ? "#60A5FA" : "#2563EB"}
        />
      </View>

      <Text
        className={`text-[15px] leading-5 font-extrabold ${
          isDark ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </Text>

      <Text
        className={`text-[10px] leading-4 font-bold mt-1 ${
          isDark ? "text-blue-400" : "text-blue-600"
        }`}
      >
        {subtitle}
      </Text>

      <Text
        className={`text-[11px] leading-[17px] mt-3 ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {description}
      </Text>
    </View>
  );
}

/* ================================================================ */
/* FOCUS POINT */
/* ================================================================ */

function FocusPoint({
  icon,
  title,
  desc,
  isDark,
  last = false,
}: {
  icon: any;
  title: string;
  desc: string;
  isDark: boolean;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center ${
        !last
          ? `pb-5 mb-5 border-b ${
              isDark ? "border-slate-800" : "border-slate-100"
            }`
          : ""
      }`}
    >
      <View
        className="w-11 h-11 rounded-[14px] items-center justify-center mr-3"
        style={{
          backgroundColor: isDark ? "#172554" : "#EFF6FF",
        }}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isDark ? "#60A5FA" : "#2563EB"}
        />
      </View>

      <View className="flex-1">
        <Text
          className={`text-[14px] font-bold ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {title}
        </Text>

        <Text
          className={`text-[12px] leading-[18px] mt-1 ${
            isDark ? "text-slate-500" : "text-slate-500"
          }`}
        >
          {desc}
        </Text>
      </View>
    </View>
  );
}

/* ================================================================ */
/* SKILL SECTION */
/* ================================================================ */

function SkillSection({
  section,
  isDark,
}: {
  section: {
    title: string;
    icon: any;
    skills: string[];
  };
  isDark: boolean;
}) {
  return (
    <View
      className={`rounded-[22px] p-5 mb-3 border ${
        isDark ? "bg-[#0F172A] border-[#1E293B]" : "bg-white border-[#E8EDF4]"
      }`}
    >
      <View className="flex-row items-center mb-4">
        <View
          className="w-9 h-9 rounded-[11px] items-center justify-center"
          style={{
            backgroundColor: isDark ? "#172554" : "#EFF6FF",
          }}
        >
          <Ionicons
            name={section.icon}
            size={17}
            color={isDark ? "#60A5FA" : "#2563EB"}
          />
        </View>

        <Text
          className={`ml-3 text-[14px] font-bold ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {section.title}
        </Text>
      </View>

      <View className="flex-row flex-wrap">
        {section.skills.map((skill) => (
          <View
            key={skill}
            className={`px-3 py-2 rounded-[10px] mr-2 mb-2 border ${
              isDark
                ? "bg-[#111C30] border-[#25334A]"
                : "bg-[#F8FAFC] border-[#E7EDF5]"
            }`}
          >
            <Text
              className={`text-[11px] font-semibold ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {skill}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
