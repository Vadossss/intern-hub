import { SearchInput } from "./SearchInput";
// import Image from "next/image";
// import { createReactEditorJS } from "react-editor-js";
// import { EDITOR_JS_TOOLS } from "./constants";
// import { useRef } from "react";
import TextEditor from "./TextEditor";

interface Props {
  className?: string;
}

export const TopMainBody: React.FC<Props> = ({ className }) => {
  // const ReactEditorJS = createReactEditorJS();
  // const editorRef = useRef<any>(null);

  // const handleInitialize = (instance: any) => {
  //   editorRef.current = instance;
  // };

  // const handleSave = async () => {
  //   const savedData = await editorRef.current.save();
  //   console.log("Saved data: ", savedData);
  // };

  return (
    <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="">
            <h1 className="text-3xl font-bold lg:text-5xl text-gray-900 mb-5">
              Найди свою первую
              <span className="text-blue-600"> работу</span>
            </h1>
            {/* <p className="text-gray-700 text-lg mb-8">
              Присоединяйся к ведущим компаниям России и получи опыт работы в
              своей области. Более 500+ активных стажировок ждут тебя.
            </p> */}

            {/* <div className="bg-white shadow-md rounded-xl p-5">
              <SearchInput />
            </div> */}

            <div className="grid grid-cols-3 gap-5 sm:gap-8 mt-8">
              <div className="text-center bg-white rounded-xl shadow-md p-3">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  500+
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Активных стажировок
                </div>
              </div>
              <div className="text-center bg-white rounded-xl shadow-md p-3">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  150+
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Компаний-партнеров
                </div>
              </div>
              <div className="text-center bg-white rounded-xl shadow-md p-3">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  2000+
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Успешных стажеров
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              className="rounded-xl shadow-xl"
              src="/MainBody.jpg"
              alt="MainBody"
            />
          </div>
          {/* <div>
            <TextEditor />
            <ReactEditorJS
              tools={EDITOR_JS_TOOLS}
              onInitialize={handleInitialize}
            />
            <button
              onClick={handleSave}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Сохранить
            </button>
          </div> */}
        </div>
      </div>
    </section>
  );
};
