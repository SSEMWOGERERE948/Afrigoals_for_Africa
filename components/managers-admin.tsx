    "use client"

    import { useEffect, useState } from "react"
    import { Card } from "@/components/ui/card"
    import { Button } from "@/components/ui/button"
    import { Input } from "@/components/ui/input"
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
    import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
    import { Badge } from "@/components/ui/badge"
    import { Alert, AlertDescription } from "@/components/ui/alert"
    import { Textarea } from "@/components/ui/textarea"
    import type { Team } from "@/app/types"
    import { fetchTeamsByType } from "@/components/team_api"
    import { createManager, fetchManagers, deleteManager, updateManager, type Manager } from "@/components/manager_api"
    import { Trash2, Pencil, Users, Trophy, Briefcase, Crown, Shield } from "lucide-react"

    interface ManagerFormData {
    id: string
    name: string
    nationality: string
    age: number
    image: string
    experience: number
    achievements: string
    tacticalStyle: string
    contractStart: string
    contractEnd: string
    role: "head_manager" | "assistant_manager"
    specialization: string
    clubTeamId: string
    nationalTeamId: string
    }

    const tacticalStyles = [
    "Attacking",
    "Defensive",
    "Possession-based",
    "Counter-attacking",
    "High-pressing",
    "Tiki-taka",
    "Direct play",
    "Balanced",
    ]

    const assistantSpecializations = [
    "Goalkeeping Coach",
    "Fitness Coach",
    "Tactical Analyst",
    "Set Piece Specialist",
    "Youth Development",
    "Scouting Coordinator",
    "Mental Performance Coach",
    "Technical Coach",
    "General Assistant",
    ]

    export default function ManagersAdmin() {
    const [clubTeams, setClubTeams] = useState<Team[]>([])
    const [nationalTeams, setNationalTeams] = useState<Team[]>([])
    const [managers, setManagers] = useState<Manager[]>([])
    const [isEditing, setIsEditing] = useState(false)
    const [managerForm, setManagerForm] = useState<ManagerFormData>({
        id: "",
        name: "",
        nationality: "",
        age: 35,
        image: "",
        experience: 0,
        achievements: "",
        tacticalStyle: "",
        contractStart: "",
        contractEnd: "",
        role: "head_manager",
        specialization: "",
        clubTeamId: "",
        nationalTeamId: "",
    })

    useEffect(() => {
        const load = async () => {
        const [clubs, nationals, managerList] = await Promise.all([
            fetchTeamsByType("club"),
            fetchTeamsByType("national"),
            fetchManagers(),
        ])
        setClubTeams(clubs)
        setNationalTeams(nationals)
        setManagers(managerList)
        }
        load()
    }, [])

    // Get teams that already have head managers
    const getTeamsWithHeadManagers = (teamType: "club" | "national") => {
        const teams = teamType === "club" ? clubTeams : nationalTeams
        return teams.filter((team) => {
        return managers.some((manager) => {
            return (
            manager.role === "head_manager" &&
            (teamType === "club"
                ? (manager as any).clubTeam?.id === team.id
                : (manager as any).nationalTeam?.id === team.id)
            )
        })
        })
    }

    const teamHasHeadManager = (teamId: string, teamType: "club" | "national") => {
        return managers.some((manager) => {
        return (
            manager.role === "head_manager" &&
            (teamType === "club" ? (manager as any).clubTeam?.id === teamId : (manager as any).nationalTeam?.id === teamId)
        )
        })
    }

    const getTeamManagers = (teamId: string, teamType: "club" | "national") => {
        return managers.filter((manager) => {
        return teamType === "club"
            ? (manager as any).clubTeam?.id === teamId
            : (manager as any).nationalTeam?.id === teamId
        })
    }

    const validateManagerAddition = () => {
        const errors = []

        // Check if trying to add head manager to team that already has one
        if (managerForm.role === "head_manager") {
        if (managerForm.clubTeamId && teamHasHeadManager(managerForm.clubTeamId, "club")) {
            const clubTeam = clubTeams.find((t) => t.id.toString() === managerForm.clubTeamId)
            errors.push(`Club team "${clubTeam?.name}" already has a head manager.`)
        }

        if (managerForm.nationalTeamId && teamHasHeadManager(managerForm.nationalTeamId, "national")) {
            const nationalTeam = nationalTeams.find((t) => t.id.toString() === managerForm.nationalTeamId)
            errors.push(`National team "${nationalTeam?.name}" already has a head manager.`)
        }
        }

        return errors
    }

    const handleAddManager = async () => {
        if (!managerForm.name || (!managerForm.clubTeamId && !managerForm.nationalTeamId)) {
        alert("Please fill in required fields and select at least one team.")
        return
        }

        // Validate manager addition
        const validationErrors = validateManagerAddition()
        if (validationErrors.length > 0) {
        alert(`Cannot add manager:\n${validationErrors.join("\n")}`)
        return
        }

        try {
        const { id, clubTeamId, nationalTeamId, achievements, ...managerData } = managerForm

        const created = await createManager({
            manager: {
            ...managerData,
            achievements: achievements
                .split(",")
                .map((a) => a.trim())
                .filter((a) => a.length > 0),
            },
            clubTeamId: clubTeamId ? Number.parseInt(clubTeamId) : undefined,
            nationalTeamId: nationalTeamId ? Number.parseInt(nationalTeamId) : undefined,
        })

        setManagers((prev) => [...prev, created])
        resetForm()
        } catch (error) {
        console.error("Failed to add manager:", error)
        alert("Failed to add manager.")
        }
    }

    const handleEditManager = (manager: Manager & any) => {
        setManagerForm({
        id: manager.id,
        name: manager.name,
        nationality: manager.nationality,
        age: manager.age,
        image: manager.image,
        experience: manager.experience,
        achievements: manager.achievements?.join(", ") || "",
        tacticalStyle: manager.tacticalStyle,
        contractStart: manager.contractStart,
        contractEnd: manager.contractEnd,
        role: manager.role,
        specialization: manager.specialization || "",
        clubTeamId: manager.clubTeam?.id?.toString() || "",
        nationalTeamId: manager.nationalTeam?.id?.toString() || "",
        })
        setIsEditing(true)
    }

    const handleUpdateManager = async () => {
        if (!managerForm.id) return

        const validationErrors = validateManagerAddition()
        if (validationErrors.length > 0) {
        alert(`Cannot update manager:\n${validationErrors.join("\n")}`)
        return
        }

        try {
        const { id, clubTeamId, nationalTeamId, achievements, ...managerData } = managerForm

        const updated = await updateManager(id, {
            manager: {
            ...managerData,
            achievements: achievements
                .split(",")
                .map((a) => a.trim())
                .filter((a) => a.length > 0),
            },
            clubTeamId: clubTeamId ? Number.parseInt(clubTeamId) : undefined,
            nationalTeamId: nationalTeamId ? Number.parseInt(nationalTeamId) : undefined,
        })

        setManagers((prev) => prev.map((m) => (m.id === id ? updated : m)))
        resetForm()
        setIsEditing(false)
        } catch (error) {
        console.error("Failed to update manager:", error)
        alert("Failed to update manager.")
        }
    }

    const handleDeleteManager = async (id: string) => {
        const managerToDelete = managers.find((m) => m.id === id)
        const teamName = (managerToDelete as any)?.clubTeam?.name || (managerToDelete as any)?.nationalTeam?.name
        const roleText = managerToDelete?.role === "head_manager" ? "Head Manager" : "Assistant Manager"

        if (
        !confirm(
            `This will remove the ${roleText} from ${teamName}. ${
            managerToDelete?.role === "head_manager"
                ? "Players cannot be added to this team until a new head manager is assigned."
                : ""
            } Continue?`,
        )
        ) {
        return
        }

        try {
        await deleteManager(id)
        setManagers((prev) => prev.filter((m) => m.id !== id))
        } catch (error) {
        console.error("Failed to delete manager:", error)
        alert("Failed to delete manager.")
        }
    }

    const resetForm = () => {
        setManagerForm({
        id: "",
        name: "",
        nationality: "",
        age: 35,
        image: "",
        experience: 0,
        achievements: "",
        tacticalStyle: "",
        contractStart: "",
        contractEnd: "",
        role: "head_manager",
        specialization: "",
        clubTeamId: "",
        nationalTeamId: "",
        })
    }

    const clubTeamsWithHeadManagers = getTeamsWithHeadManagers("club")
    const nationalTeamsWithHeadManagers = getTeamsWithHeadManagers("national")
    const clubTeamsWithoutHeadManagers = clubTeams.filter((team) => !teamHasHeadManager(team.id, "club"))
    const nationalTeamsWithoutHeadManagers = nationalTeams.filter((team) => !teamHasHeadManager(team.id, "national"))

    const stats = {
        total: managers.length,
        headManagers: managers.filter((m) => m.role === "head_manager").length,
        assistantManagers: managers.filter((m) => m.role === "assistant_manager").length,
        teamsWithHeadManagers: clubTeamsWithHeadManagers.length + nationalTeamsWithHeadManagers.length,
    }

    return (
        <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold text-blue-600">Manager Management</h1>
            <p className="text-muted-foreground">Assign head managers and assistant managers to teams</p>
        </div>

        <Alert>
            <Briefcase className="h-4 w-4" />
            <AlertDescription>
            <strong>Important:</strong> Teams need a head manager before players can be added. Assistant managers are
            optional but recommended for better team management.
            </AlertDescription>
        </Alert>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
            <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                <p className="text-sm text-muted-foreground">Total Managers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                </div>
            </div>
            </Card>

            <Card className="p-4">
            <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <div>
                <p className="text-sm text-muted-foreground">Head Managers</p>
                <p className="text-2xl font-bold">{stats.headManagers}</p>
                </div>
            </div>
            </Card>

            <Card className="p-4">
            <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                <p className="text-sm text-muted-foreground">Assistant Managers</p>
                <p className="text-2xl font-bold">{stats.assistantManagers}</p>
                </div>
            </div>
            </Card>

            <Card className="p-4">
            <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                <div>
                <p className="text-sm text-muted-foreground">Teams Ready</p>
                <p className="text-2xl font-bold">{stats.teamsWithHeadManagers}</p>
                </div>
            </div>
            </Card>
        </div>

        <Card className="p-6 space-y-6">
            <h2 className="text-xl font-semibold">Add New Manager</h2>

            <div className="grid grid-cols-2 gap-4">
            <InputField
                label="Manager Name *"
                value={managerForm.name}
                onChange={(v) => setManagerForm({ ...managerForm, name: v })}
            />
            <InputField
                label="Nationality *"
                value={managerForm.nationality}
                onChange={(v) => setManagerForm({ ...managerForm, nationality: v })}
            />
            <InputField
                label="Age *"
                type="number"
                value={managerForm.age}
                onChange={(v) => setManagerForm({ ...managerForm, age: Number.parseInt(v) || 35 })}
            />
            <InputField
                label="Experience (Years) *"
                type="number"
                value={managerForm.experience}
                onChange={(v) => setManagerForm({ ...managerForm, experience: Number.parseInt(v) || 0 })}
            />

            <div>
                <label className="text-sm font-medium mb-1 block">Manager Role *</label>
                <Select
                value={managerForm.role}
                onValueChange={(val: "head_manager" | "assistant_manager") =>
                    setManagerForm({ ...managerForm, role: val })
                }
                >
                <SelectTrigger>
                    <SelectValue placeholder="Select Manager Role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="head_manager">
                    <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-yellow-600" />
                        Head Manager
                    </div>
                    </SelectItem>
                    <SelectItem value="assistant_manager">
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        Assistant Manager
                    </div>
                    </SelectItem>
                </SelectContent>
                </Select>
            </div>

            {managerForm.role === "head_manager" ? (
                <div>
                <label className="text-sm font-medium mb-1 block">Tactical Style *</label>
                <Select
                    value={managerForm.tacticalStyle}
                    onValueChange={(val) => setManagerForm({ ...managerForm, tacticalStyle: val })}
                >
                    <SelectTrigger>
                    <SelectValue placeholder="Select Tactical Style" />
                    </SelectTrigger>
                    <SelectContent>
                    {tacticalStyles.map((style) => (
                        <SelectItem key={style} value={style}>
                        {style}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
            ) : (
                <div>
                <label className="text-sm font-medium mb-1 block">Specialization *</label>
                <Select
                    value={managerForm.specialization}
                    onValueChange={(val) => setManagerForm({ ...managerForm, specialization: val })}
                >
                    <SelectTrigger>
                    <SelectValue placeholder="Select Specialization" />
                    </SelectTrigger>
                    <SelectContent>
                    {assistantSpecializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                        {spec}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
            )}
            </div>

            <InputField
            label="Image URL"
            value={managerForm.image}
            onChange={(v) => setManagerForm({ ...managerForm, image: v })}
            />

            <div className="grid grid-cols-2 gap-4">
            <InputField
                label="Contract Start Date"
                type="date"
                value={managerForm.contractStart}
                onChange={(v) => setManagerForm({ ...managerForm, contractStart: v })}
            />
            <InputField
                label="Contract End Date"
                type="date"
                value={managerForm.contractEnd}
                onChange={(v) => setManagerForm({ ...managerForm, contractEnd: v })}
            />
            </div>

            <div>
            <label className="text-sm font-medium mb-1 block">Achievements (comma-separated)</label>
            <Textarea
                placeholder="e.g., Premier League Winner 2020, Champions League Winner 2019, FA Cup Winner 2018"
                value={managerForm.achievements}
                onChange={(e) => setManagerForm({ ...managerForm, achievements: e.target.value })}
            />
            </div>

            <div className="grid grid-cols-2 gap-4">
            <ManagerTeamSelect
                label="Club Team"
                value={managerForm.clubTeamId || "none"}
                teams={clubTeams}
                onChange={(val) => setManagerForm({ ...managerForm, clubTeamId: val })}
                teamHasHeadManager={teamHasHeadManager}
                teamType="club"
                managerRole={managerForm.role}
                getTeamManagers={getTeamManagers}
            />
            <ManagerTeamSelect
                label="National Team"
                value={managerForm.nationalTeamId || "none"}
                teams={nationalTeams}
                onChange={(val) => setManagerForm({ ...managerForm, nationalTeamId: val })}
                teamHasHeadManager={teamHasHeadManager}
                teamType="national"
                managerRole={managerForm.role}
                getTeamManagers={getTeamManagers}
            />
            </div>

            <div className="flex gap-2 mt-6">
            {isEditing ? (
                <>
                <Button onClick={handleUpdateManager} className="bg-blue-600 hover:bg-blue-700">
                    Update Manager
                </Button>
                <Button
                    variant="outline"
                    onClick={() => {
                    resetForm()
                    setIsEditing(false)
                    }}
                >
                    Cancel
                </Button>
                </>
            ) : (
                <Button onClick={handleAddManager} className="bg-blue-600 hover:bg-blue-700">
                Add Manager
                </Button>
            )}
            </div>
        </Card>

        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Managers List</h2>
            {managers.length === 0 ? (
            <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No managers added yet.</p>
            </div>
            ) : (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Style/Specialization</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {managers.map((manager: Manager & any) => (
                    <TableRow key={manager.id}>
                    <TableCell>
                        <img
                        src={manager.image || "/placeholder.svg?height=40&width=40"}
                        alt={manager.name}
                        className="h-10 w-10 rounded-full object-cover"
                        />
                    </TableCell>
                    <TableCell className="font-medium">{manager.name}</TableCell>
                    <TableCell>
                        <Badge
                        variant={manager.role === "head_manager" ? "default" : "secondary"}
                        className={
                            manager.role === "head_manager"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }
                        >
                        {manager.role === "head_manager" ? (
                            <div className="flex items-center gap-1">
                            <Crown className="h-3 w-3" />
                            Head Manager
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Assistant
                            </div>
                        )}
                        </Badge>
                    </TableCell>
                    <TableCell>{manager.age}</TableCell>
                    <TableCell>
                        <Badge variant="outline">{manager.experience} years</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                        {manager.role === "head_manager" ? manager.tacticalStyle : manager.specialization}
                    </TableCell>
                    <TableCell>{manager.clubTeam?.name || manager.nationalTeam?.name || "N/A"}</TableCell>
                    <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleEditManager(manager)}>
                            <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteManager(manager.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                        </div>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            )}
        </Card>
        </div>
    )
    }

    // Input Field Component
    function InputField({
    label,
    value,
    onChange,
    type = "text",
    }: {
    label: string
    value: string | number
    onChange: (val: string) => void
    type?: string
    }) {
    return (
        <div>
        <label className="text-sm font-medium mb-1 block">{label}</label>
        <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
    )
    }

    // Manager Team Select Component
    function ManagerTeamSelect({
    label,
    value,
    teams,
    onChange,
    teamHasHeadManager,
    teamType,
    managerRole,
    getTeamManagers,
    }: {
    label: string
    value: string
    teams: Team[]
    onChange: (val: string) => void
    teamHasHeadManager: (teamId: string, teamType: "club" | "national") => boolean
    teamType: "club" | "national"
    managerRole: "head_manager" | "assistant_manager"
    getTeamManagers: (teamId: string, teamType: "club" | "national") => Manager[]
    }) {
    return (
        <div>
        <label className="text-sm font-medium mb-1 block">{label}</label>
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
            <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="none">No {label}</SelectItem>

            {teams.map((team) => {
                const hasHeadManager = teamHasHeadManager(team.id, teamType)
                const teamManagers = getTeamManagers(team.id, teamType)
                const canAssign = managerRole === "assistant_manager" || (managerRole === "head_manager" && !hasHeadManager)

                return (
                <SelectItem key={team.id} value={team.id.toString()} disabled={!canAssign}>
                    <div className="flex items-center gap-2">
                    <span>{team.name}</span>
                    {hasHeadManager && (
                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                        <Crown className="h-3 w-3 mr-1" />
                        Has Head Manager
                        </Badge>
                    )}
                    {teamManagers.filter((m) => m.role === "assistant_manager").length > 0 && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        <Shield className="h-3 w-3 mr-1" />
                        {teamManagers.filter((m) => m.role === "assistant_manager").length} Assistant(s)
                        </Badge>
                    )}
                    {!canAssign && managerRole === "head_manager" && (
                        <Badge variant="destructive" className="text-xs">
                        Cannot assign
                        </Badge>
                    )}
                    </div>
                </SelectItem>
                )
            })}
            </SelectContent>
        </Select>
        </div>
    )
    }
