import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }: any) => {
    const { user }: any = locals;
    const data = await request.json();
    const db = await clientPromise();
    const Profile = db.collection('profile');
    
    data._id = id();
    const profile = await Profile.findOne({ 'username': user.username });


    const profileUpdate = {
        $set: {
            updatedAt: new Date(),
            updatedBy: locals.user._id,
            lastName: data.lastName,
            firstName: data.firstName,
            middleName: data.middleName,
            workTitle: data.workTitle,
            email: data.email,
            about: data.about,
            workBackground: data.workBackground,
            expertise: data.expertise,
            degree: data.degree,
            city: data.city,
            nationality: data.nationality,
            civilStatus: data.civilStatus,
            website: data.website,
            isAvailable: data.isAvailable,
            experience: data.experience,
            collegeDegree: data.collegeDegree,
            collegeYear: data.collegeYear,
            collegeSchool: data.collegeSchool,
            collegeDescription: data.collegeDescription,
            mastersDegree: data.mastersDegree,
            mastersYear: data.mastersYear,
            mastersSchool: data.mastersSchool,
            mastersDescription: data.mastersDescription,
            facts: {
                projects: data.facts.projects,
                students: data.facts.students,
                companies: data.facts.companies,
            },
            yearStarted: data.yearStarted,
            username: user.username
        }
    }

    let response: unknown;

    if (profile) {
        response = await Profile.updateOne({ _id: profile._id }, profileUpdate);
    } else {
        response = await Profile.insertOne(data);
    }

    if (response) {
        return new Response(
            JSON.stringify({
                status: 'Success',
                message: 'Data updated successfully',
                response
            })
        );
    }
}
