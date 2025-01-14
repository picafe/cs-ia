import { ClassCard } from "../components/ClassCard";

export default function ClassList() {

    return (
        <div className="m-8 flex flex-col align-">
            <h1 className="text-4xl font-bold">Classes</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <ClassCard />
                <ClassCard />
                <ClassCard />
                <ClassCard />
                <ClassCard />
                <ClassCard />
                <ClassCard />
                <ClassCard />
            </div>
        </div>

    )
}