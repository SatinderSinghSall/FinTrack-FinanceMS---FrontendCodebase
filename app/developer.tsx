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
    },
    {
      label: "LinkedIn",
      icon: "logo-linkedin",
      url: "https://www.linkedin.com/in/satinder-singh-sall-b62049204",
      color: "#2563eb",
    },
    {
      label: "X / Twitter",
      icon: "logo-twitter",
      url: "https://x.com/SallSatinder",
      color: "#0f172a",
    },
    {
      label: "YouTube",
      icon: "logo-youtube",
      url: "https://www.youtube.com/@satindersinghsall.3841/featured",
      color: "#dc2626",
    },
    {
      label: "Portfolio",
      icon: "earth",
      url: "https://satinder-portfolio.vercel.app",
      color: "green",
    },
  ];

  const skillSections = [
    {
      title: "Frontend & Mobile",
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
      className={`flex-1 ${isDark ? "bg-[#030712]" : "bg-gray-100"}`}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 80,
        }}
      >
        {/* TOP HEADER */}
        <View className="flex-row items-center justify-between mb-8 mt-2">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className={`w-12 h-12 rounded-2xl items-center justify-center ${
              isDark ? "bg-[#111827]" : "bg-white"
            }`}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? "#fff" : "#111827"}
            />
          </TouchableOpacity>

          <Text
            className={`text-lg font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Meet the Developer
          </Text>

          <TouchableOpacity
            onPress={toggleColorScheme}
            activeOpacity={0.8}
            className={`w-12 h-12 rounded-2xl items-center justify-center ${
              isDark ? "bg-[#111827]" : "bg-white"
            }`}
          >
            <Ionicons
              name={isDark ? "sunny-outline" : "moon-outline"}
              size={22}
              color={isDark ? "#fff" : "#111827"}
            />
          </TouchableOpacity>
        </View>

        {/* HERO */}
        <View className="mb-10">
          <View className="w-24 h-24 rounded-[30px] bg-indigo-500 items-center justify-center mb-6">
            <Ionicons name="code-slash" size={42} color="#fff" />
          </View>

          <Text
            className={`text-4xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Satinder Singh Sall
          </Text>

          <Text className="text-indigo-500 text-lg mt-2 font-semibold">
            Full-Stack Product Engineer
          </Text>

          <Text
            className={`text-base leading-7 mt-5 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Building scalable, production-ready digital systems across mobile,
            backend, cloud, AI/ML, and full-stack platforms with a focus on
            clean architecture, performance, and real-world usability.
          </Text>
        </View>

        {/* ABOUT */}
        <View
          className={`border rounded-3xl p-6 mb-8 ${
            isDark ? "bg-[#111827] border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <View className="flex-row items-center mb-5">
            <Ionicons name="person-circle-outline" size={24} color="#818cf8" />

            <Text
              className={`text-xl font-semibold ml-3 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              About Me
            </Text>
          </View>

          <Text
            className={`leading-7 text-base ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            I build scalable, production-ready digital products with a focus on
            performance, maintainability, and clean architecture.
          </Text>

          <Text
            className={`leading-7 text-base mt-4 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            My expertise spans full-stack development, mobile engineering,
            backend systems, DevOps, cloud infrastructure, and AI-powered
            applications using React, React Native, Node.js, Express,
            TypeScript, MongoDB, SQL systems, Docker, and modern deployment
            workflows.
          </Text>

          <Text
            className={`leading-7 text-base mt-4 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Currently pursuing MCA at KiiT University while actively building
            production-grade software products and expanding into AI
            engineering, intelligent systems, and game development.
          </Text>
        </View>

        {/* SERVICES */}
        <View className="mb-8">
          <Text
            className={`text-2xl font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Services
          </Text>

          <Text
            className={`text-base mb-6 leading-7 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Building scalable, production-ready digital products with modern
            technologies, cloud infrastructure, AI systems, and clean
            engineering practices.
          </Text>

          <View className="flex-row flex-wrap justify-between">
            <ServiceCard
              icon="code-slash-outline"
              title="Web Development"
              subtitle="React · Next.js · TypeScript"
              description="Modern, responsive, and scalable web applications built with clean architecture and performance in mind."
              isDark={isDark}
            />

            <ServiceCard
              icon="phone-portrait-outline"
              title="Mobile App Development"
              subtitle="React Native · Android"
              description="Cross-platform mobile apps with smooth UX, fast performance, and native-like experiences."
              isDark={isDark}
            />

            <ServiceCard
              icon="layers-outline"
              title="Full Stack Solutions"
              subtitle="Frontend · Backend · APIs"
              description="End-to-end product development covering architecture, APIs, databases, authentication, and deployment."
              isDark={isDark}
            />

            <ServiceCard
              icon="hardware-chip-outline"
              title="AI / ML Engineering"
              subtitle="GenAI · ML · Intelligent Systems"
              description="AI-powered applications using Machine Learning, Deep Learning, OpenAI APIs, RAG pipelines, and intelligent workflows."
              isDark={isDark}
            />

            <ServiceCard
              icon="git-network-outline"
              title="RAG & Agentic AI"
              subtitle="LLMs · AI Agents · Automation"
              description="Building context-aware AI systems, retrieval pipelines, multi-step AI agents, and intelligent automation workflows."
              isDark={isDark}
            />

            <ServiceCard
              icon="cloud-outline"
              title="DevOps & Cloud"
              subtitle="Docker · CI/CD · Deployment"
              description="Scalable deployment pipelines, Dockerized infrastructure, CI/CD systems, and cloud-native workflows."
              isDark={isDark}
            />
          </View>
        </View>

        {/* WHAT I DO */}
        <View
          className={`border rounded-3xl p-6 mb-8 ${
            isDark ? "bg-[#111827] border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <View className="flex-row items-center mb-6">
            <Feather name="cpu" size={22} color="#22c55e" />

            <Text
              className={`text-xl font-semibold ml-3 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Focus Areas
            </Text>
          </View>

          <DeveloperPoint
            icon="phone-portrait-outline"
            title="Mobile App Development"
            desc="Cross-platform mobile applications with React Native & Expo."
            isDark={isDark}
          />

          <DeveloperPoint
            icon="globe-outline"
            title="Full-Stack Web Development"
            desc="Modern frontend systems with scalable backend architectures."
            isDark={isDark}
          />

          <DeveloperPoint
            icon="server-outline"
            title="Backend Engineering"
            desc="REST APIs, authentication systems, databases & security."
            isDark={isDark}
          />

          <DeveloperPoint
            icon="cloud-outline"
            title="DevOps & Cloud"
            desc="Docker, CI/CD pipelines, deployment workflows & cloud systems."
            isDark={isDark}
          />

          <DeveloperPoint
            icon="sparkles-outline"
            title="AI / ML Engineering"
            desc="Generative AI, RAG systems, OpenAI APIs & ML workflows."
            isDark={isDark}
          />

          <DeveloperPoint
            icon="game-controller-outline"
            title="Game Development"
            desc="Interactive gameplay systems and Unity-based experiences."
            isDark={isDark}
          />
        </View>

        {/* SKILLS */}
        <View
          className={`border rounded-3xl p-6 mb-8 ${
            isDark ? "bg-[#111827] border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <View className="flex-row items-center mb-6">
            <FontAwesome5 name="laptop-code" size={18} color="#38bdf8" />

            <Text
              className={`text-xl font-semibold ml-3 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Skills & Technologies
            </Text>
          </View>

          {skillSections.map((section) => (
            <View key={section.title} className="mb-7">
              <Text
                className={`text-sm font-bold uppercase mb-4 ${
                  isDark ? "text-indigo-300" : "text-indigo-600"
                }`}
              >
                {section.title}
              </Text>

              <View className="flex-row flex-wrap">
                {section.skills.map((skill) => (
                  <View
                    key={skill}
                    className={`px-4 py-2 rounded-2xl mr-3 mb-3 border ${
                      isDark
                        ? "bg-[#1f2937] border-gray-700"
                        : "bg-gray-100 border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* SOCIALS */}
        <View
          className={`border rounded-3xl p-6 mb-8 ${
            isDark ? "bg-[#111827] border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <Text
            className={`text-xl font-semibold mb-6 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Connect With Me
          </Text>

          {socials.map((social) => (
            <TouchableOpacity
              key={social.label}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(social.url)}
              className="flex-row items-center p-5 rounded-2xl mb-4"
              style={{ backgroundColor: social.color }}
            >
              <Ionicons name={social.icon as any} size={22} color="#fff" />

              <Text className="text-white text-base font-semibold ml-4">
                {social.label}
              </Text>

              <View className="ml-auto">
                <Ionicons
                  name="open-outline"
                  size={18}
                  color="rgba(255,255,255,0.7)"
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* FOOTER */}
        <View className="items-center pt-4">
          <Text
            className={`text-center leading-6 ${
              isDark ? "text-gray-500" : "text-gray-500"
            }`}
          >
            Building scalable digital products with engineering, AI, cloud, and
            performance in mind.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DeveloperPoint({
  icon,
  title,
  desc,
  isDark,
}: {
  icon: any;
  title: string;
  desc: string;
  isDark: boolean;
}) {
  return (
    <View className="flex-row items-start mb-6">
      <View
        className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
          isDark ? "bg-[#1f2937]" : "bg-gray-100"
        }`}
      >
        <Ionicons name={icon} size={22} color="#818cf8" />
      </View>

      <View className="flex-1">
        <Text
          className={`text-base font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </Text>

        <Text
          className={`text-sm mt-1 leading-6 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {desc}
        </Text>
      </View>
    </View>
  );
}

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
      className={`w-[48%] rounded-[30px] p-5 mb-4 border overflow-hidden ${
        isDark ? "bg-[#0f172a] border-[#1e293b]" : "bg-white border-gray-200"
      }`}
      style={{
        shadowColor: isDark ? "#000" : "#6366f1",
        shadowOffset: {
          width: 0,
          height: 10,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
      }}
    >
      {/* TOP GLOW */}
      <View
        className={`absolute top-0 left-0 right-0 h-[2px] ${
          isDark ? "bg-indigo-500" : "bg-indigo-400"
        }`}
      />

      {/* ICON */}
      <View
        className={`w-16 h-16 rounded-[22px] items-center justify-center mb-5 ${
          isDark ? "bg-[#172554]" : "bg-indigo-100"
        }`}
        style={{
          shadowColor: "#6366f1",
          shadowOffset: {
            width: 0,
            height: 6,
          },
          shadowOpacity: 0.25,
          shadowRadius: 12,
        }}
      >
        <Ionicons
          name={icon}
          size={28}
          color={isDark ? "#818cf8" : "#4f46e5"}
        />
      </View>

      {/* TITLE */}
      <Text
        className={`text-[19px] font-extrabold leading-7 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {title}
      </Text>

      {/* SUBTITLE */}
      <Text
        className={`text-[13px] mt-1 font-medium ${
          isDark ? "text-indigo-300" : "text-indigo-600"
        }`}
      >
        {subtitle}
      </Text>

      {/* DIVIDER */}
      <View
        className={`h-[1px] my-4 ${isDark ? "bg-[#1e293b]" : "bg-gray-200"}`}
      />

      {/* DESCRIPTION */}
      <Text
        className={`text-[14px] leading-7 ${
          isDark ? "text-gray-300" : "text-gray-600"
        }`}
      >
        {description}
      </Text>

      {/* BOTTOM BADGE */}
      <View className="mt-5 flex-row items-center">
        <View
          className={`px-3 py-1 rounded-full ${
            isDark ? "bg-[#172554]" : "bg-indigo-100"
          }`}
        >
          <Text
            className={`text-[11px] font-bold uppercase tracking-wider ${
              isDark ? "text-indigo-300" : "text-indigo-700"
            }`}
          >
            Production Ready
          </Text>
        </View>
      </View>
    </View>
  );
}
