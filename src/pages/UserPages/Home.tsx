import React from "react";
import Navbar from "../../components/authentication/Navbar";
import "../../index.css";

const Home = () => {
  return (
    <>
      <Navbar isAuthenticated={true} />
      <div className="grid bg-pure-white grid-cols-1 md:grid-cols-2 gap-8 p-5 ">
        <div className=" p-5 flex justify-center items-center text-left">
          <div className="">
            <h1 className="prime-font text-3xl md:text-5xl mb-4 leading-tight">
              Grow up Your skills <br /> by online courses <br /> with{" "}
              <span className="text-medium-rose">Edu-Nexus</span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed">
              Edu-Nexus is an interesting platform that will teach you <br /> in
              a more interactive way
            </p>
            <div className="flex mt-6 justify-between items-center w-[55%]">
              <div className="bg-purple-500">
                <button className="p-4 bg-medium-rose rounded-3xl font-semibold text-white">
                  Join Now
                </button>
              </div>
              <div>
                <button className="p-4 bg-lite-rose rounded-3xl font-semibold text-black">
                  View Demo
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className=" p-5 flex justify-center items-center">
          <img
            src="/assets/png/teaching.png"
            alt="Teaching"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
      <div className="bg-gray-300 flex flex-col md:flex-row justify-between items-center p-5 md:p-0">
        <div className=" w-full md:w-1/4 text-center p-10">
          <h2 className="font-bold text-2xl">250+</h2>
          <p>Courses by our best mentors</p>
        </div>
        <div className="flex justify-center items-center w-full md:w-auto p-5">
          <img
            src="/assets/png/line.png"
            className="w-20 h-auto"
            alt="Line Divider"
          />
        </div>
        <div className="w-full md:w-1/4 text-center p-10">
          <h2 className="font-bold text-2xl">1000+</h2>
          <p>Courses by our best mentors</p>
        </div>
        <div className="flex justify-center items-center w-full md:w-auto p-5">
          <img
            src="/assets/png/line.png"
            className="w-20 h-auto"
            alt="Line Divider"
          />
        </div>
        <div className="w-full md:w-1/4 text-center p-10">
          <h2 className="font-bold text-2xl">15+</h2>
          <p>Courses by our best mentors</p>
        </div>
        <div className="flex justify-center items-center w-full md:w-auto p-5">
          <img
            src="/assets/png/line.png"
            className="w-20 h-auto"
            alt="Line Divider"
          />
        </div>
        <div className="w-full md:w-1/4 text-center p-10">
          <h2 className="font-bold text-2xl">2400+</h2>
          <p>Courses by our best mentors</p>
        </div>
      </div>
      <div className="">
        <button className="float-end mr-10 mt-5 rounded-3xl font-sans bg-lite-rose px-3 py-2 text-sm font-medium">
          All Categories
        </button>
      </div>
      <div className="container mx-auto p-5">
        <h2 className="text-lg font-semibold mb-5">Top Categories</h2>
        <div className="grid grid-cols-4 gap-8">
          <div className="border border-gray-300 shadow-xl rounded-md text-center p-6">
            <div
              className="bg-lite-rose p-5 rounded-full mx-auto"
              style={{ width: "80px", height: "80px" }}
            >
              <img src="/assets/png/physics.png" alt="" />
            </div>
            <h1 className="mt-3 text-xl font-semibold font-sans">Physics</h1>
            <p>11 Courses</p>
          </div>
          <div className="border  border-gray-300 shadow-xl rounded-md text-center p-6">
            <div
              className="bg-lite-rose p-5 rounded-full mx-auto"
              style={{ width: "80px", height: "80px" }}
            >
              <img src="/assets/png/dev.png" alt="" />
            </div>
            <h1 className="mt-3 text-xl font-semibold font-sans">
              Development
            </h1>
            <p>11 Courses</p>
          </div>
          <div className="border  border-gray-300 shadow-xl rounded-md text-center p-6">
            <div
              className="bg-lite-rose p-5 rounded-full mx-auto"
              style={{ width: "80px", height: "80px" }}
            >
              <img src="/assets/png/shop.png" alt="" />
            </div>
            <h1 className="mt-3 text-xl font-semibold font-sans">Biology</h1>
            <p>11 Courses</p>
          </div>
          <div className="border  border-gray-300 shadow-xl rounded-md text-center p-6">
            <div
              className="bg-lite-rose p-5 rounded-full mx-auto"
              style={{ width: "80px", height: "80px" }}
            >
              <img src="/assets/png/Icon.png" alt="" />
            </div>
            <h1 className="mt-3 text-xl font-semibold font-sans">Chemistry</h1>
            <p>11 Courses</p>
          </div>
        </div>
        <div className="mt-12 flex justify-between p-4">
          <h1 className="text-xl font-semibold">New Courses</h1>
          <button className="p-2 bg-gray-400 rounded-md">AllCourses</button>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-5">
          <div className="bg-pure-white text-start rounded-sm p-4">
            <img
              src="/assets/images/signup.png"
              width="70%"
              height="30%"
              className="mx-auto"
              alt=""
            />
            <h1 className="font-semibold text-md mt-3">Title</h1>
            <div className="flex justify-between mt-3">
              <div className="flex items-center">
                <img
                  src="/assets/png/lesson.png"
                  width=""
                  className="w-3 h-3 mr-1"
                  alt=""
                />
                <p className="text-sm">Lesson : 17</p>
              </div>
              <div className="flex items-center">
                <img
                  src="/assets/png/student.png"
                  alt=""
                  className="w-3 h-3 mr-1"
                />
                <p className="text-sm">student : 17</p>
              </div>
              <div className="flex items-center">
                <img
                  src="/assets/png/level.png"
                  alt=""
                  className="w-3 h-3 mr-1"
                />
                <p className="text-sm">Advanced</p>
              </div>
            </div>
            <button className="bg-black py-1 px-3 text-white rounded-xl mt-5 flex items-center">
              Start Course
              <span>
                <img src="/assets/png/next.png" alt="" className="w-4 ml-2" />
              </span>
            </button>
          </div>
          <div className="bg-pure-white text-start rounded-sm p-4">
            <img
              src="/assets/images/signup.png"
              width="70%"
              height="30%"
              className="mx-auto"
              alt=""
            />
            <h1 className="font-semibold text-md mt-3">Title</h1>
            <div className="flex justify-between mt-3">
              <div className="flex items-center">
                <img
                  src="/assets/png/lesson.png"
                  width=""
                  className="w-3 h-3 mr-1"
                  alt=""
                />
                <p className="text-sm">Lesson : 17</p>
              </div>
              <div className="flex items-center">
                <img
                  src="/assets/png/student.png"
                  alt=""
                  className="w-3 h-3 mr-1"
                />
                <p className="text-sm">student : 17</p>
              </div>
              <div className="flex items-center">
                <img
                  src="/assets/png/level.png"
                  alt=""
                  className="w-3 h-3 mr-1"
                />
                <p className="text-sm">Advanced</p>
              </div>
            </div>
            <button className="bg-black py-1 px-3 text-white rounded-xl mt-5 flex items-center">
              Start Course
              <span>
                <img src="/assets/png/next.png" alt="" className="w-4 ml-2" />
              </span>
            </button>
          </div>
          <div className="bg-pure-white text-start rounded-sm p-4">
            <img
              src="/assets/images/signup.png"
              width="70%"
              height="30%"
              className="mx-auto"
              alt=""
            />
            <h1 className="font-semibold text-md mt-3">Title</h1>
            <div className="flex justify-between mt-3">
              <div className="flex items-center">
                <img
                  src="/assets/png/lesson.png"
                  width=""
                  className="w-3 h-3 mr-1"
                  alt=""
                />
                <p className="text-sm">Lesson : 17</p>
              </div>
              <div className="flex items-center">
                <img
                  src="/assets/png/student.png"
                  alt=""
                  className="w-3 h-3 mr-1"
                />
                <p className="text-sm">student : 17</p>
              </div>
              <div className="flex items-center">
                <img
                  src="/assets/png/level.png"
                  alt=""
                  className="w-3 h-3 mr-1"
                />
                <p className="text-sm">Advanced</p>
              </div>
            </div>
            <button className="bg-black  py-1 px-3 text-white rounded-xl mt-5 flex items-center">
              Start Course
              <span>
                <img src="/assets/png/next.png" alt="" className="w-4 ml-2" />
              </span>
            </button>
          </div>
          <div className="bg-pure-white text-start rounded-sm p-4">
            <img
              src="/assets/images/signup.png"
              width="70%"
              height="30%"
              className="mx-auto"
              alt=""
            />
            <h1 className="font-semibold text-md">Title</h1>
            <div className="flex justify-between mt-3">
              <div className="flex items-center">
                <img
                  src="/assets/png/lesson.png"
                  width=""
                  className="w-3 h-3 mr-1"
                  alt=""
                />
                <p className="text-sm">Lesson : 17</p>
              </div>
              <div className="flex items-center">
                <img
                  src="/assets/png/student.png"
                  alt=""
                  className="w-3 h-3 mr-1"
                />
                <p className="text-sm">student : 17</p>
              </div>
              <div className="flex items-center">
                <img
                  src="/assets/png/level.png"
                  alt=""
                  className="w-3 h-3 mr-1"
                />
                <p className="text-sm">Advanced</p>
              </div>
            </div>
            <button className="bg-black py-1 px-3 text-white rounded-xl mt-5 flex items-center">
              Start Course
              <span>
                <img src="/assets/png/next.png" alt="" className="w-4 ml-2" />
              </span>
            </button>
          </div>
        </div>
        <section className="relative">
          <div className="grid grid-cols-6 gap-4 mt-12">
            <div className="col-span-2 py-20">
              <h1 className="thick-font">Best Instructors</h1>
              <p>
                At The Academy, We Strive To Bring Together The Best <br />
                Professors For The Best Courses
              </p>
              <button className="bg-medium-rose py-2 px-3 text-white rounded-xl mt-10 flex items-center">
                All Instructors
                <span>
                  <img src="/assets/png/next.png" alt="" className="w-4 ml-2" />
                </span>
              </button>
            </div>
            <div className="bg-pure-white col-span-4 mt-12 relative">
              <img
                src="/assets/png/background.png"
                className="rounded-2xl"
                alt=""
              />
              <div className="grid grid-cols-6 gap-6 p-4 absolute top-0 right-16 -mt-16">
                <div className="col-span-2 bg-white p-3 rounded-xl">
                  <img
                    src="/assets/images/person1.png"
                    className="rounded-xl"
                    alt=""
                  />
                  <div className="flex justify-between mt-4">
                    <h6 className="font-semibold">Jon Kartner</h6>
                    <p>Designer</p>
                  </div>
                </div>
                <div className="col-span-2 bg-white p-3 rounded-xl">
                  <img
                    src="/assets/images/person2.png"
                    className="rounded-xl"
                    alt=""
                  />
                  <div className="flex justify-between mt-4">
                    <h6 className="font-semibold">Jon Kartner</h6>
                    <p>Designer</p>
                  </div>
                </div>
                <div className="col-span-2 bg-white p-3 rounded-xl">
                  <img
                    src="/assets/images/person3.png"
                    className="rounded-xl"
                    alt=""
                  />
                  <div className="flex justify-between mt-4">
                    <h6 className="font-semibold">Jon Kartner</h6>
                    <p>Designer</p>
                  </div>
                </div>
                <div className="col-span-2 bg-white p-3 rounded-xl">
                  <img
                    src="/assets/images/person4.png"
                    className="rounded-xl"
                    alt=""
                  />
                  <div className="flex justify-between mt-4">
                    <h6 className="font-semibold">Jon Kartner</h6>
                    <p>Designer</p>
                  </div>
                </div>
                <div className="col-span-2 bg-white p-3 rounded-xl">
                  <img
                    src="/assets/images/person5.png"
                    className="rounded-xl"
                    alt=""
                  />
                  <div className="flex justify-between mt-4">
                    <h6 className="font-semibold">Jon Kartner</h6>
                    <p>Designer</p>
                  </div>
                </div>
                <div className="col-span-2 bg-white p-3 rounded-xl">
                  <img
                    src="/assets/images/person6.png"
                    className="rounded-xl"
                    alt="fdfd"
                  />
                  <div className="flex justify-between mt-4">
                    <h6 className="font-semibold">Jon dartner</h6>
                    <p>Designer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section>
          <div>
            <h1 className="poppins-semibold text-3xl mt-44 text-center">
              Our <span className="text-medium-rose">Features</span>
            </h1>
            <h6 className="text-center mt-4 ">
              This very extraordinary feature,can make learning activities more
              efficient
            </h6>
          </div>
          <div className="grid grid-cols-2 mt-10 gap-8">
    <div>
        <img src="/assets/images/feature.png" alt="" />
    </div>
    <div className=" p-4">
        <h1 className="poppins-semibold font-bold mb-6">
            A <span className="text-medium-rose">user interface</span> designed <br /> for the classroom
        </h1>
        <div className="flex justify-start items-center mb-4 p-3 rounded-lg">
            <div className="bg-rose-50 rounded-full shadow-2xl p-3 mr-4">
                <img src="/assets/images/point2.png" className="mx-auto" alt="" />
            </div>
            <h5 className="text-black text-xl">
            Teachers don’t get lost in the grid view and have a dedicated Podium space.
            </h5>
        </div>
        <div className="flex justify-start items-center mb-4 p-3 rounded-lg">
            <div className="bg-rose-50 rounded-full shadow-2xl p-3 mr-4">
                <img src="/assets/images/point3.png" className="mx-auto" alt="" />
            </div>
            <h5 className="text-black text-xl">
                Teacher’s and presenters can be moved to the front of the class.
            </h5>
        </div>
        <div className="flex justify-start items-center p-3 rounded-lg">
            <div className="bg-rose-50 rounded-full shadow-2xl p-3 mr-4">
                <img src="/assets/images/point1.png" className="mx-auto" alt="" />
            </div>
            <h5 className="text-black text-xl">
                Teachers can easily see all students and class data at one time.
            </h5>
        </div>
    </div>
</div>

        </section>
        <section>
            <div className="grid grid-cols-2 gap-4 mt-12">
                <div className="py-20">
                    <h1 className="text-2xl"> <span className="text-medium-rose poppins-normal font-bold">Tools</span> for Teachers <br /> And Learners</h1>
                    <h4 className="text-2xl mt-5 ">Class has a dynamic set of teaching tools built to <br />be deployed and used during class.
                    Teachers can <br />handout assignments in real-time for students to <br /> complete and submit.</h4>
                </div>
                <div className="poppins-normal">
                    <img src="/assets/images/feature2.png" width='80%' alt="" />
                </div>
            </div>
        </section>
        <section>
            <div className="grid grid-cols-2 gap-4">
                <div className="">
                    <img src="/assets/images/feature3.png" alt="" />
                </div>
                <div className="">
                    <h1 className="poppins-semibold"><span className="text-medium-rose">Assessments</span>, <br /><span className="text-black">Quizzes</span>,<span className="text-medium-rose">Tests</span></h1>
                    <h4 className="text-2xl  mt-8">Easily launch live assignments, quizzes, and tests. <br />
                    Student results are automatically entered in the <br />online gradebook.</h4>
                </div>
            </div>
        </section>
      </div>
    </>
  );
};

export default Home;
